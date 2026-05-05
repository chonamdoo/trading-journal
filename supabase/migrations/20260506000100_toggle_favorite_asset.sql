create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  symbol text not null check (btrim(symbol) <> ''),
  created_at timestamptz not null default now()
);

update public.favorites
set symbol = upper(btrim(symbol))
where symbol <> upper(btrim(symbol));

delete from public.favorites a
using public.favorites b
where a.user_id = b.user_id
  and upper(btrim(a.symbol)) = upper(btrim(b.symbol))
  and a.created_at > b.created_at;

create unique index if not exists favorites_user_symbol_norm_uq
  on public.favorites (user_id, upper(btrim(symbol)));

alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
  on public.favorites
  for select
  using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
  on public.favorites
  for delete
  using (auth.uid() = user_id);

create or replace function public.toggle_favorite_asset(
  p_user_id uuid,
  p_symbol text
)
returns table (
  favorited boolean,
  id uuid
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_existing_id uuid;
  v_inserted_id uuid;
  v_symbol text;
begin
  v_symbol := upper(btrim(coalesce(p_symbol, '')));
  if v_symbol = '' then
    raise exception 'symbol is required';
  end if;

  if auth.uid() is distinct from p_user_id then
    raise exception 'not allowed';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || v_symbol, 0));

  select favorites.id
    into v_existing_id
  from public.favorites
  where favorites.user_id = p_user_id
    and favorites.symbol = v_symbol
  limit 1;

  if v_existing_id is not null then
    delete from public.favorites
    where favorites.id = v_existing_id;

    return query select false, null::uuid;
    return;
  end if;

  insert into public.favorites (user_id, symbol)
  values (p_user_id, v_symbol)
  returning favorites.id into v_inserted_id;

  return query select true, v_inserted_id;
end;
$$;

# 013 Local Supabase Testing

Status: planned
Parent PRD: `specs/013-clean-architecture-refactor.md`

## Purpose

Automated tests must not write to production Supabase. Local Supabase is the default persistence/auth target for future slices that need RLS, auth, migrations, or seeded data.

## Local Setup Path

Prerequisites:

- Docker running.
- Supabase CLI available through `npx supabase`.

Commands:

```bash
npx supabase init
npx supabase start
npx supabase db reset
```

Use the local API URL and anon key printed by `npx supabase start` in `.env.local`.

## Test Account Policy

- Production `demo@mytradelog.app` is manual Smoke Test only.
- Automated tests must use a local Supabase test user.
- Do not commit test user passwords or local keys.
- Seed data must be synthetic and safe to reset.

## Future Slice Work

Future auth/persistence slices should add deterministic local user seeding before they introduce automated tests that require authenticated Supabase access.

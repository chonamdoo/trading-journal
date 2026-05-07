ALTER TABLE public.deposits
  DROP CONSTRAINT IF EXISTS deposits_amount_check;

ALTER TABLE public.deposits
  ADD CONSTRAINT deposits_amount_check CHECK (amount <> 0);

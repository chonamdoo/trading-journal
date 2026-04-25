-- Store original exchange rows for import mapping verification.

ALTER TABLE trades
ADD COLUMN IF NOT EXISTS raw_exchange_payload JSONB;

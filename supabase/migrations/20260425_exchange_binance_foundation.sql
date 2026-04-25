-- Binance exchange sync foundation.

ALTER TABLE trades
ADD COLUMN IF NOT EXISTS exchange TEXT,
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS fee NUMERIC,
ADD COLUMN IF NOT EXISTS fee_asset TEXT,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS import_status TEXT DEFAULT 'confirmed';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trades_source_check'
  ) THEN
    ALTER TABLE trades
    ADD CONSTRAINT trades_source_check
    CHECK (source IN ('manual', 'api', 'csv'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trades_import_status_check'
  ) THEN
    ALTER TABLE trades
    ADD CONSTRAINT trades_import_status_check
    CHECK (import_status IN ('draft', 'confirmed'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_trades_user_exchange_external
ON trades(user_id, exchange, external_id)
WHERE external_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS exchange_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL,
  label TEXT,
  api_key_encrypted JSONB NOT NULL,
  api_secret_encrypted JSONB NOT NULL,
  passphrase_encrypted JSONB,
  permissions_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT exchange_connections_exchange_check
    CHECK (exchange IN ('binance')),
  CONSTRAINT exchange_connections_user_exchange_unique
    UNIQUE (user_id, exchange)
);

CREATE INDEX IF NOT EXISTS idx_exchange_connections_user_id
ON exchange_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_exchange_connections_active
ON exchange_connections(user_id, exchange)
WHERE is_active = true;

CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES exchange_connections(id) ON DELETE SET NULL,
  exchange TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  from_time TIMESTAMPTZ,
  to_time TIMESTAMPTZ,
  trades_found INTEGER NOT NULL DEFAULT 0,
  trades_imported INTEGER NOT NULL DEFAULT 0,
  trades_skipped INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  CONSTRAINT sync_logs_exchange_check
    CHECK (exchange IN ('binance')),
  CONSTRAINT sync_logs_status_check
    CHECK (status IN ('running', 'success', 'failed', 'partial'))
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_user_started
ON sync_logs(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_logs_connection
ON sync_logs(connection_id, started_at DESC);

ALTER TABLE exchange_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sync_logs_select_own" ON sync_logs;
CREATE POLICY "sync_logs_select_own"
ON sync_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

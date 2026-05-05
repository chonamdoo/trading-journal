-- Tighten exchange credential access after initial Binance foundation.

ALTER TABLE exchange_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exchange_connections_select_own" ON exchange_connections;
DROP POLICY IF EXISTS "exchange_connections_insert_own" ON exchange_connections;
DROP POLICY IF EXISTS "exchange_connections_update_own" ON exchange_connections;
DROP POLICY IF EXISTS "exchange_connections_delete_own" ON exchange_connections;

CREATE POLICY "exchange_connections_select_own"
ON exchange_connections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "exchange_connections_insert_own"
ON exchange_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exchange_connections_update_own"
ON exchange_connections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exchange_connections_delete_own"
ON exchange_connections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Do not let browser clients read encrypted API credential columns directly.
REVOKE SELECT ON exchange_connections FROM anon;
GRANT SELECT ON exchange_connections TO authenticated;
GRANT SELECT (
  id,
  exchange,
  label,
  permissions_verified,
  is_active,
  last_synced_at,
  created_at,
  updated_at
) ON exchange_connections TO authenticated;

GRANT INSERT, UPDATE, DELETE ON exchange_connections TO authenticated;

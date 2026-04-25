-- Add Flipster to supported exchange values.

ALTER TABLE exchange_connections
DROP CONSTRAINT IF EXISTS exchange_connections_exchange_check;

ALTER TABLE exchange_connections
ADD CONSTRAINT exchange_connections_exchange_check
CHECK (exchange IN ('binance', 'bybit', 'okx', 'bitget', 'flipster'));

ALTER TABLE sync_logs
DROP CONSTRAINT IF EXISTS sync_logs_exchange_check;

ALTER TABLE sync_logs
ADD CONSTRAINT sync_logs_exchange_check
CHECK (exchange IN ('binance', 'bybit', 'okx', 'bitget', 'flipster'));

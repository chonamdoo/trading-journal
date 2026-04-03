-- C-1: trades 테이블에 stop_loss_price 컬럼 추가

ALTER TABLE trades
  ADD COLUMN stop_loss_price NUMERIC(24,8) NULL;

COMMENT ON COLUMN trades.stop_loss_price IS '손절가 (USDT). NULL이면 미설정.';

-- 유효성 제약: 양수만 허용 (NULL은 OK)
ALTER TABLE trades
  ADD CONSTRAINT trades_stop_loss_price_positive
  CHECK (stop_loss_price IS NULL OR stop_loss_price > 0);

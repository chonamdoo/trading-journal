-- trade_scale_ins 테이블에 quantity 컬럼 추가
-- 증거금 또는 수량 중 택1 입력을 지원하기 위함
ALTER TABLE trade_scale_ins
  ADD COLUMN quantity NUMERIC NULL;

-- 기존 데이터에 대해 quantity 역산 (margin * leverage / entry_price)
UPDATE trade_scale_ins si
SET quantity = (si.margin * t.leverage) / si.entry_price
FROM trades t
WHERE si.trade_id = t.id
  AND si.entry_price > 0;

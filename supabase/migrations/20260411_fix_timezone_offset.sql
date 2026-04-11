-- Fix timezone offset bug: datetime-local values were stored as UTC
-- instead of being converted from KST (UTC+9) to UTC first.
-- All existing data was entered by KST users, so we subtract 9 hours to correct.
--
-- Before: user entered "08:26 KST" → stored as "08:26 UTC" (wrong, should be "23:26 UTC")
-- After:  "08:26 UTC" - 9h = "23:26 UTC" (previous day) → displays as "08:26 KST" (correct)

-- trades 테이블
UPDATE trades
SET entry_datetime = entry_datetime - INTERVAL '9 hours'
WHERE entry_datetime IS NOT NULL;

UPDATE trades
SET exit_datetime = exit_datetime - INTERVAL '9 hours'
WHERE exit_datetime IS NOT NULL;

-- trade_closes 테이블 (분할 청산)
UPDATE trade_closes
SET exit_datetime = exit_datetime - INTERVAL '9 hours'
WHERE exit_datetime IS NOT NULL;

-- trade_scale_ins 테이블 (추가진입)
UPDATE trade_scale_ins
SET entry_datetime = entry_datetime - INTERVAL '9 hours'
WHERE entry_datetime IS NOT NULL;

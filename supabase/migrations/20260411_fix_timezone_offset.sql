-- Fix timezone offset bug: datetime-local values were stored as UTC
-- instead of being converted from KST (UTC+9) to UTC first.
-- Real users (KST) only — demo seed data excluded.
--
-- Before: user entered "08:26 KST" → stored as "08:26 UTC" (wrong, should be "23:26 UTC")
-- After:  "08:26 UTC" - 9h = "23:26 UTC" (previous day) → displays as "08:26 KST" (correct)

-- demo 계정 제외 조건
-- demo@mytradelog.app는 시드 데이터(일괄 삽입)로 datetime-local 경유 안 함

-- trades 테이블
UPDATE trades
SET entry_datetime = entry_datetime - INTERVAL '9 hours'
WHERE entry_datetime IS NOT NULL
  AND user_id != (SELECT id FROM auth.users WHERE email = 'demo@mytradelog.app');

UPDATE trades
SET exit_datetime = exit_datetime - INTERVAL '9 hours'
WHERE exit_datetime IS NOT NULL
  AND user_id != (SELECT id FROM auth.users WHERE email = 'demo@mytradelog.app');

-- trade_closes 테이블 (분할 청산)
UPDATE trade_closes
SET exit_datetime = exit_datetime - INTERVAL '9 hours'
WHERE exit_datetime IS NOT NULL
  AND user_id != (SELECT id FROM auth.users WHERE email = 'demo@mytradelog.app');

-- trade_scale_ins 테이블 (추가진입)
UPDATE trade_scale_ins
SET entry_datetime = entry_datetime - INTERVAL '9 hours'
WHERE entry_datetime IS NOT NULL
  AND user_id != (SELECT id FROM auth.users WHERE email = 'demo@mytradelog.app');

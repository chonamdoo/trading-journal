-- SPEC-005: 주간 자동 리포트 — monthly_reports 테이블 확장
-- 기존 monthly 데이터는 period_type='monthly', week=NULL으로 유지된다.

-- 1. period_type 컬럼 추가 (기존 데이터는 'monthly')
ALTER TABLE monthly_reports
  ADD COLUMN IF NOT EXISTS period_type TEXT NOT NULL DEFAULT 'monthly';

-- 2. week 컬럼 추가 (ISO week number, monthly/yearly는 null)
ALTER TABLE monthly_reports
  ADD COLUMN IF NOT EXISTS week INT;

-- 3. period_type CHECK 제약
ALTER TABLE monthly_reports
  ADD CONSTRAINT monthly_reports_period_type_check
  CHECK (period_type IN ('weekly', 'monthly', 'yearly'));

-- 4. 기존 UNIQUE 제약 교체
--    기존 제약명이 없을 수 있으므로 존재 시만 DROP
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'monthly_reports_user_id_year_month_key'
  ) THEN
    ALTER TABLE monthly_reports
      DROP CONSTRAINT monthly_reports_user_id_year_month_key;
  END IF;
END$$;

ALTER TABLE monthly_reports
  ADD CONSTRAINT monthly_reports_user_period_unique
  UNIQUE (user_id, year, month, week, period_type);

-- 5. 주간 리포트 최신 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_monthly_reports_weekly
  ON monthly_reports (user_id, period_type, created_at DESC)
  WHERE period_type = 'weekly';

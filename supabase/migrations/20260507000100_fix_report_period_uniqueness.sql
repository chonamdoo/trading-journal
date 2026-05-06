-- SPEC-005 Slice 1: Fix report period uniqueness.
-- The original unique constraint included nullable week, so monthly rows could duplicate.

ALTER TABLE monthly_reports
  DROP CONSTRAINT IF EXISTS monthly_reports_user_period_unique;

DROP INDEX IF EXISTS monthly_reports_monthly_period_unique;
DROP INDEX IF EXISTS monthly_reports_weekly_period_unique;

DELETE FROM monthly_reports
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, year, month
        ORDER BY created_at DESC, id DESC
      ) AS row_number
    FROM monthly_reports
    WHERE period_type = 'monthly'
  ) duplicates
  WHERE row_number > 1
);

DELETE FROM monthly_reports
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, year, week
        ORDER BY created_at DESC, id DESC
      ) AS row_number
    FROM monthly_reports
    WHERE period_type = 'weekly'
      AND week IS NOT NULL
  ) duplicates
  WHERE row_number > 1
);

DELETE FROM monthly_reports
WHERE period_type = 'weekly'
  AND week IS NULL;

CREATE UNIQUE INDEX monthly_reports_monthly_period_unique
  ON monthly_reports (user_id, year, month)
  WHERE period_type = 'monthly';

CREATE UNIQUE INDEX monthly_reports_weekly_period_unique
  ON monthly_reports (user_id, year, week)
  WHERE period_type = 'weekly';

ALTER TABLE monthly_reports
  DROP CONSTRAINT IF EXISTS monthly_reports_week_required_check;

ALTER TABLE monthly_reports
  ADD CONSTRAINT monthly_reports_week_required_check
  CHECK (period_type != 'weekly' OR week IS NOT NULL);

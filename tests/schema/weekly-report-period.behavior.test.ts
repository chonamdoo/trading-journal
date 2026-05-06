import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const originalMigration = readFileSync(
  'supabase/migrations/20260412000000_weekly_reports.sql',
  'utf8',
);
const correctiveMigration = readFileSync(
  'supabase/migrations/20260507000100_fix_report_period_uniqueness.sql',
  'utf8',
);

describe('weekly report period schema', () => {
  it('enforces monthly report uniqueness without relying on nullable week', () => {
    expect(originalMigration).toMatch(/monthly_reports_user_period_unique/i);
    expect(correctiveMigration).toMatch(/DROP\s+CONSTRAINT\s+IF\s+EXISTS\s+monthly_reports_user_period_unique/i);
    expect(correctiveMigration).toMatch(/monthly_reports_monthly_period_unique/i);
    expect(correctiveMigration).toMatch(
      /CREATE\s+UNIQUE\s+INDEX\s+monthly_reports_monthly_period_unique[\s\S]*ON\s+monthly_reports\s*\(\s*user_id\s*,\s*year\s*,\s*month\s*\)[\s\S]*WHERE\s+period_type\s*=\s*'monthly'/i,
    );
  });

  it('enforces weekly report uniqueness by ISO week', () => {
    expect(correctiveMigration).toMatch(/monthly_reports_weekly_period_unique/i);
    expect(correctiveMigration).toMatch(
      /CREATE\s+UNIQUE\s+INDEX\s+monthly_reports_weekly_period_unique[\s\S]*ON\s+monthly_reports\s*\(\s*user_id\s*,\s*year\s*,\s*week\s*\)[\s\S]*WHERE\s+period_type\s*=\s*'weekly'/i,
    );
    expect(correctiveMigration).toMatch(
      /CHECK\s*\(\s*period_type\s*!=\s*'weekly'\s+OR\s+week\s+IS\s+NOT\s+NULL\s*\)/i,
    );
  });
});

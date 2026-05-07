import { describe, expect, it } from 'vitest';

import {
  formatReportPeriodLabel,
  getEmptyReportMessage,
  selectLatestReport,
} from '@/lib/report-period-presentation';
import type { MonthlyReportRow } from '@/lib/supabase/types';

function report(
  id: string,
  periodType: 'weekly' | 'monthly',
  createdAt: string,
  week: number | null = null,
): MonthlyReportRow {
  return {
    id,
    user_id: 'user-1',
    year: 2026,
    month: 5,
    week,
    period_type: periodType,
    period_start: '2026-05-01',
    period_end: '2026-05-31',
    trade_count: 1,
    win_rate: 100,
    total_pnl: 10,
    report_markdown: '# Report',
    stats: null,
    model_used: 'gemini',
    created_at: createdAt,
  };
}

describe('report period presentation', () => {
  it('selects the newest report for the active period', () => {
    const selected = selectLatestReport('weekly', [
      report('monthly-1', 'monthly', '2026-05-04T00:00:00.000Z'),
      report('weekly-old', 'weekly', '2026-05-05T00:00:00.000Z', 18),
      report('weekly-new', 'weekly', '2026-05-06T00:00:00.000Z', 19),
    ]);

    expect(selected?.id).toBe('weekly-new');
  });

  it('formats monthly and weekly report period labels separately', () => {
    expect(formatReportPeriodLabel(report('monthly-1', 'monthly', '2026-05-01T00:00:00.000Z'))).toBe(
      '2026년 5월',
    );
    expect(formatReportPeriodLabel(report('weekly-1', 'weekly', '2026-05-01T00:00:00.000Z', 19))).toBe(
      '2026년 19주차',
    );
  });

  it('uses period-specific empty copy', () => {
    expect(getEmptyReportMessage('monthly')).toContain('월간');
    expect(getEmptyReportMessage('weekly')).toContain('주간');
  });
});

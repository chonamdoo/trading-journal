import type { MonthlyReportRow } from '@/lib/supabase/types';

import type { Report } from '../../domain/entities/report';

export function mapReportToMonthlyReportResponse(report: Report): MonthlyReportRow {
  return {
    id: report.id,
    user_id: report.userId,
    year: report.reportPeriod.year,
    month: report.reportPeriod.month,
    period_start: report.reportPeriod.startDate,
    period_end: report.reportPeriod.endDate,
    trade_count: report.tradeCount,
    win_rate: report.winRate,
    total_pnl: report.totalPnl,
    report_markdown: report.reportMarkdown,
    stats: report.aiReportStats as MonthlyReportRow['stats'],
    model_used: report.modelUsed,
    created_at: report.createdAt,
    period_type: report.reportPeriod.type,
    week: report.reportPeriod.week,
  };
}

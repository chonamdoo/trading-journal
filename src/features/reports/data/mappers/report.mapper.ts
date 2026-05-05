import type { Report } from '../../domain/entities/report';
import type { ReportRowDto } from '../dto/report-row.dto';

function parseNumeric(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) return null;
  return num;
}

export function mapReportRowToReport(row: ReportRowDto): Report {
  return {
    id: row.id,
    userId: row.user_id,
    reportPeriod: {
      type: row.period_type,
      year: row.year,
      month: row.month,
      week: row.week,
      startDate: row.period_start,
      endDate: row.period_end,
    },
    tradeCount: row.trade_count,
    winRate: parseNumeric(row.win_rate),
    totalPnl: parseNumeric(row.total_pnl),
    reportMarkdown: row.report_markdown,
    aiReportStats: row.stats,
    modelUsed: row.model_used,
    createdAt: row.created_at,
  };
}

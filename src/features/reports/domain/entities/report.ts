import type { ReportPeriod } from './report-period';

export type Report = {
  id: string;
  userId: string;
  reportPeriod: ReportPeriod;
  tradeCount: number;
  winRate: number | null;
  totalPnl: number | null;
  reportMarkdown: string;
  aiReportStats: unknown;
  modelUsed: string;
  createdAt: string;
};

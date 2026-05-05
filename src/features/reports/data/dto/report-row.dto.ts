import type { MonthlyReportRow } from '@/lib/supabase/types';

export type ReportRowDto = Omit<MonthlyReportRow, 'win_rate' | 'total_pnl'> & {
  win_rate: number | string | null;
  total_pnl: number | string | null;
};

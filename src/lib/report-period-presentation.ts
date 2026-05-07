import type { MonthlyReportRow } from '@/lib/supabase/types';

export type ReportPeriodSelection = 'monthly' | 'weekly';

export function selectLatestReport(
  periodType: ReportPeriodSelection,
  reports: MonthlyReportRow[],
): MonthlyReportRow | null {
  const candidates = reports.filter((report) => report.period_type === periodType);
  if (candidates.length === 0) return null;

  return [...candidates].sort((a, b) => (
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ))[0];
}

export function formatReportPeriodLabel(report: MonthlyReportRow | null): string | null {
  if (!report) return null;
  if (report.period_type === 'weekly') {
    return `${report.year}년 ${report.week ?? '-'}주차`;
  }

  return `${report.year}년 ${report.month}월`;
}

export function getEmptyReportMessage(periodType: ReportPeriodSelection): string {
  return periodType === 'weekly'
    ? '주간 리포트가 아직 생성되지 않았습니다.'
    : '월간 리포트가 아직 생성되지 않았습니다.';
}

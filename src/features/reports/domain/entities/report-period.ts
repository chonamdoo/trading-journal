export type ReportPeriodType = 'weekly' | 'monthly' | 'yearly';

export type ReportPeriod = {
  type: ReportPeriodType;
  year: number;
  month: number;
  week: number | null;
  startDate: string;
  endDate: string;
};

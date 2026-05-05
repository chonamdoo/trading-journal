import type { ReportPeriodType } from '../entities/report-period';
import type { Report } from '../entities/report';

export type ReportRepository = {
  findManyByUser(userId: string, periodType?: ReportPeriodType): Promise<Report[]>;
  findById(reportId: string): Promise<Report | null>;
};

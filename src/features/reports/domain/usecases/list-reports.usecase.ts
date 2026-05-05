import type { ReportPeriodType } from '../entities/report-period';
import type { ReportRepository } from '../repositories/report.repository';

export type ListReportsRequest = {
  userId: string;
  periodType?: ReportPeriodType;
};

export function createListReportsUseCase(reportRepository: ReportRepository) {
  return {
    execute({ userId, periodType }: ListReportsRequest) {
      return reportRepository.findManyByUser(userId, periodType);
    },
  };
}

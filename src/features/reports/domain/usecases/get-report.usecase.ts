import type { ReportRepository } from '../repositories/report.repository';

export function createGetReportUseCase(reportRepository: ReportRepository) {
  return {
    execute(reportId: string) {
      return reportRepository.findById(reportId);
    },
  };
}

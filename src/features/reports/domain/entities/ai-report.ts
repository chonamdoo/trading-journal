import type { AIReportData } from '@/types/ai-report';

import type { Report } from './report';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function prepareAiReportStats(report: Report): AIReportData | null {
  const stats = report.aiReportStats;
  if (!isRecord(stats)) return null;

  if (
    typeof stats.headline !== 'string' ||
    typeof stats.masterScore !== 'number' ||
    !isRecord(stats.kpis) ||
    !Array.isArray(stats.behavioralPatterns) ||
    !Array.isArray(stats.recommendations) ||
    !Array.isArray(stats.radarData)
  ) {
    return null;
  }

  return stats as unknown as AIReportData;
}

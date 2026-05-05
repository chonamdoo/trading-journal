import { describe, expect, it } from 'vitest';

import { mapReportRowToReport } from './data/mappers/report.mapper';
import { prepareAiReportStats } from './domain/entities/ai-report';
import { createListReportsUseCase } from './domain/usecases/list-reports.usecase';

describe('Reports feature module', () => {
  it('keeps Report Period selection explicit when listing Reports', async () => {
    const calls: Array<{ userId: string; periodType?: 'weekly' | 'monthly' | 'yearly' }> = [];
    const listReports = createListReportsUseCase({
      async findManyByUser(userId, periodType) {
        calls.push({ userId, periodType });
        return [];
      },
      async findById() {
        return null;
      },
    });

    await listReports.execute({ userId: 'user-1', periodType: 'weekly' });

    expect(calls).toEqual([{ userId: 'user-1', periodType: 'weekly' }]);
  });

  it('maps Report row fields and prepares valid AI Report stats', () => {
    const report = mapReportRowToReport({
      id: 'report-1',
      user_id: 'user-1',
      year: 2026,
      month: 5,
      period_start: '2026-05-04',
      period_end: '2026-05-10',
      trade_count: 7,
      win_rate: '57.14',
      total_pnl: '120.50',
      report_markdown: '# Weekly report',
      stats: {
        headline: 'Good discipline',
        masterScore: 82,
        masterScoreGrade: 'good',
        kpis: {
          profitFactor: 1.8,
          maxDrawdown: 5,
          avgHoldTime: '3h',
          winRate: 57.14,
          sharpeRatio: 1.2,
        },
        behavioralPatterns: [],
        emotionWinRates: [],
        timeHeatmap: [],
        recommendations: [],
        radarData: [],
      },
      model_used: 'gemini',
      created_at: '2026-05-05T00:00:00Z',
      period_type: 'weekly',
      week: 19,
    });

    const stats = prepareAiReportStats(report);

    expect(report.reportPeriod).toEqual({
      type: 'weekly',
      year: 2026,
      month: 5,
      week: 19,
      startDate: '2026-05-04',
      endDate: '2026-05-10',
    });
    expect(report.winRate).toBe(57.14);
    expect(report.totalPnl).toBe(120.5);
    expect(stats?.headline).toBe('Good discipline');
    expect(stats?.masterScore).toBe(82);
  });

  it('does not prepare malformed AI Report stats', () => {
    const report = mapReportRowToReport({
      id: 'report-1',
      user_id: 'user-1',
      year: 2026,
      month: 5,
      period_start: '2026-05-01',
      period_end: '2026-05-31',
      trade_count: 7,
      win_rate: null,
      total_pnl: null,
      report_markdown: '# Monthly report',
      stats: { headline: 'missing score' },
      model_used: 'gemini',
      created_at: '2026-05-05T00:00:00Z',
      period_type: 'monthly',
      week: null,
    });

    expect(prepareAiReportStats(report)).toBeNull();
  });
});

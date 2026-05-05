import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/reports/route';

const listReports = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  withAuth: async (_req: NextRequest, handler: (supabase: unknown, userId: string) => Promise<Response>) => {
    return handler({ from: vi.fn() }, 'user-1');
  },
}));

vi.mock('@/features/reports/di.server', () => ({
  createReportsCompositionRoot: () => ({
    listReports: {
      execute: listReports,
    },
  }),
}));

describe('GET /api/reports', () => {
  beforeEach(() => {
    listReports.mockReset();
  });

  it('passes Report Period selection through the Reports Composition Root', async () => {
    listReports.mockResolvedValue([
      {
        id: 'report-1',
        userId: 'user-1',
        reportPeriod: {
          type: 'weekly',
          year: 2026,
          month: 5,
          week: 19,
          startDate: '2026-05-04',
          endDate: '2026-05-10',
        },
        tradeCount: 7,
        winRate: 57.14,
        totalPnl: 120.5,
        reportMarkdown: '# Weekly report',
        aiReportStats: null,
        modelUsed: 'gemini',
        createdAt: '2026-05-05T00:00:00Z',
      },
    ]);

    const response = await GET(new NextRequest('http://localhost/api/reports?periodType=weekly'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(listReports).toHaveBeenCalledWith({ userId: 'user-1', periodType: 'weekly' });
    expect(body).toEqual({
      success: true,
      data: [
        {
          id: 'report-1',
          user_id: 'user-1',
          year: 2026,
          month: 5,
          period_start: '2026-05-04',
          period_end: '2026-05-10',
          trade_count: 7,
          win_rate: 57.14,
          total_pnl: 120.5,
          report_markdown: '# Weekly report',
          stats: null,
          model_used: 'gemini',
          created_at: '2026-05-05T00:00:00Z',
          period_type: 'weekly',
          week: 19,
        },
      ],
    });
  });
});

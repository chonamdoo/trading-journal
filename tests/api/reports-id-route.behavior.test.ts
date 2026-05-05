import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/reports/[id]/route';

const getReport = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  withAuth: async (_req: NextRequest, handler: (supabase: unknown, userId: string) => Promise<Response>) => {
    return handler({ from: vi.fn() }, 'user-1');
  },
}));

vi.mock('@/features/reports/di.server', () => ({
  createReportsCompositionRoot: () => ({
    getReport: {
      execute: getReport,
    },
  }),
}));

describe('GET /api/reports/[id]', () => {
  beforeEach(() => {
    getReport.mockReset();
  });

  it('returns a Report through the Reports Composition Root', async () => {
    getReport.mockResolvedValue({
      id: 'report-1',
      userId: 'user-1',
      reportPeriod: {
        type: 'monthly',
        year: 2026,
        month: 5,
        week: null,
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      tradeCount: 7,
      winRate: 57.14,
      totalPnl: 120.5,
      reportMarkdown: '# Monthly report',
      aiReportStats: null,
      modelUsed: 'gemini',
      createdAt: '2026-05-05T00:00:00Z',
    });

    const response = await GET(
      new NextRequest('http://localhost/api/reports/report-1'),
      { params: Promise.resolve({ id: 'report-1' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getReport).toHaveBeenCalledWith('report-1');
    expect(body.data.id).toBe('report-1');
    expect(body.data.period_type).toBe('monthly');
  });

  it('keeps the existing 400 response when the Report does not exist', async () => {
    getReport.mockResolvedValue(null);

    const response = await GET(
      new NextRequest('http://localhost/api/reports/missing'),
      { params: Promise.resolve({ id: 'missing' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Report not found' });
  });
});

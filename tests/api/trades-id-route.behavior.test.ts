import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/trades/[id]/route';

const findById = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  withAuth: async (_req: NextRequest, handler: (supabase: unknown, userId: string) => Promise<Response>) => {
    return handler({ from: vi.fn() }, 'user-1');
  },
}));

vi.mock('@/features/trades/di.server', () => ({
  createTradesCompositionRoot: () => ({
    getTrade: {
      execute: findById,
    },
  }),
}));

describe('GET /api/trades/[id]', () => {
  beforeEach(() => {
    findById.mockReset();
  });

  it('returns a Trade through the Trades Composition Root', async () => {
    findById.mockResolvedValue({
      id: 'trade-1',
      margin: 100,
      tradingPnl: 10,
    });

    const response = await GET(
      new NextRequest('http://localhost/api/trades/trade-1'),
      { params: Promise.resolve({ id: 'trade-1' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(findById).toHaveBeenCalledWith('trade-1');
    expect(body).toEqual({
      success: true,
      data: {
        id: 'trade-1',
        margin: 100,
        tradingPnl: 10,
      },
    });
  });

  it('returns 404 when the Trade does not exist', async () => {
    findById.mockResolvedValue(null);

    const response = await GET(
      new NextRequest('http://localhost/api/trades/missing'),
      { params: Promise.resolve({ id: 'missing' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Trade not found' });
  });
});

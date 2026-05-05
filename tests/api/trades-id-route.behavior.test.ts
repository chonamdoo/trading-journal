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

  it('returns the legacy TradeRow response shape through the Trades Composition Root', async () => {
    findById.mockResolvedValue({
      id: 'trade-1',
      userId: 'user-1',
      date: '2026-05-05',
      entryDatetime: '2026-05-05T01:00:00.000Z',
      exitDatetime: null,
      asset: 'BTC',
      positionDirection: 'LONG',
      leverage: 10,
      entryPrice: 100,
      exitPrice: null,
      stopLossPrice: null,
      margin: 100,
      status: 'open',
      tradingPnl: 10,
      tradeRationale: 'breakout',
      tradeReview: null,
      tradeTags: ['plan'],
      tradeEmotion: 'calm',
      tradeSource: 'exchange',
      exchange: 'bybit',
      externalId: 'external-1',
      fee: 0.1,
      feeAsset: 'USDT',
      syncedAt: '2026-05-05T01:01:00.000Z',
      importStatus: 'confirmed',
      rawExchangePayload: { orderId: 'external-1' },
      createdAt: '2026-05-05T01:02:00.000Z',
      updatedAt: '2026-05-05T01:03:00.000Z',
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
        user_id: 'user-1',
        date: '2026-05-05',
        entry_datetime: '2026-05-05T01:00:00.000Z',
        exit_datetime: null,
        asset: 'BTC',
        direction: 'LONG',
        leverage: 10,
        entry_price: 100,
        exit_price: null,
        stop_loss_price: null,
        margin: 100,
        status: 'open',
        pnl: 10,
        reason: 'breakout',
        notes: null,
        tags: ['plan'],
        emotion: 'calm',
        exchange: 'bybit',
        external_id: 'external-1',
        source: 'api',
        fee: 0.1,
        fee_asset: 'USDT',
        synced_at: '2026-05-05T01:01:00.000Z',
        import_status: 'confirmed',
        raw_exchange_payload: { orderId: 'external-1' },
        created_at: '2026-05-05T01:02:00.000Z',
        updated_at: '2026-05-05T01:03:00.000Z',
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

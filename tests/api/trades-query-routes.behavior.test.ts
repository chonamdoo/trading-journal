import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TradeRow } from '@/lib/supabase/types';

const mocks = vi.hoisted(() => {
  const trade: TradeRow = {
    id: 'trade-1',
    user_id: 'user-1',
    date: '2026-05-07',
    entry_datetime: null,
    exit_datetime: null,
    asset: 'BTC',
    direction: 'LONG',
    leverage: 5,
    entry_price: 100,
    exit_price: null,
    stop_loss_price: null,
    margin: 100,
    status: 'open',
    pnl: null,
    reason: null,
    notes: null,
    tags: null,
    emotion: null,
    exchange: null,
    external_id: null,
    fee: null,
    fee_asset: null,
    source: 'manual',
    import_status: null,
    raw_exchange_payload: null,
    synced_at: null,
    created_at: '2026-05-07T00:00:00.000Z',
    updated_at: '2026-05-07T00:00:00.000Z',
  };

  return {
    trade,
    withAuth: vi.fn(async (_req, handler) => handler({ from: vi.fn() }, 'user-1')),
    getOpenTrades: vi.fn(async () => ({ success: true, data: [trade] })),
    getRecentTrades: vi.fn(async () => ({ success: true, data: [trade] })),
    getTrades: vi.fn(async () => ({ success: true, data: { trades: [trade], total: 1 } })),
  };
});

vi.mock('@/lib/api/auth', () => ({
  withAuth: mocks.withAuth,
}));

vi.mock('@/lib/api/trades', () => ({
  getOpenTrades: mocks.getOpenTrades,
  getRecentTrades: mocks.getRecentTrades,
  getTrades: mocks.getTrades,
}));

import * as closedTradesRoute from '@/app/api/trades/closed/route';
import * as openTradesRoute from '@/app/api/trades/open/route';
import * as recentTradesRoute from '@/app/api/trades/recent/route';

describe('/api/trades query routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.withAuth.mockImplementation(async (_req, handler) => handler({ from: vi.fn() }, 'user-1'));
    mocks.getOpenTrades.mockResolvedValue({ success: true, data: [mocks.trade] });
    mocks.getRecentTrades.mockResolvedValue({ success: true, data: [mocks.trade] });
    mocks.getTrades.mockResolvedValue({ success: true, data: { trades: [mocks.trade], total: 1 } });
  });

  it('returns open trades for the authenticated user', async () => {
    const response = await openTradesRoute.GET(new NextRequest('http://localhost/api/trades/open'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: [mocks.trade] });
    expect(mocks.getOpenTrades).toHaveBeenCalledWith(expect.anything(), 'user-1');
  });

  it('returns recent trades with the requested limit', async () => {
    const response = await recentTradesRoute.GET(new NextRequest('http://localhost/api/trades/recent?limit=3'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: [mocks.trade] });
    expect(mocks.getRecentTrades).toHaveBeenCalledWith(expect.anything(), 'user-1', 3);
  });

  it('returns closed trades through the shared trade query', async () => {
    const response = await closedTradesRoute.GET(new NextRequest('http://localhost/api/trades/closed?pageSize=100'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: { trades: [mocks.trade], total: 1 } });
    expect(mocks.getTrades).toHaveBeenCalledWith(expect.anything(), 'user-1', {
      status: 'closed',
      pageSize: 100,
    });
  });

  it('propagates upstream failures', async () => {
    mocks.getOpenTrades.mockResolvedValueOnce({ success: false, error: 'open failed' } as never);
    mocks.getRecentTrades.mockResolvedValueOnce({ success: false, error: 'recent failed' } as never);
    mocks.getTrades.mockResolvedValueOnce({ success: false, error: 'closed failed' } as never);

    const openResponse = await openTradesRoute.GET(new NextRequest('http://localhost/api/trades/open'));
    const recentResponse = await recentTradesRoute.GET(new NextRequest('http://localhost/api/trades/recent'));
    const closedResponse = await closedTradesRoute.GET(new NextRequest('http://localhost/api/trades/closed'));

    expect(openResponse.status).toBe(400);
    expect(await openResponse.json()).toEqual({ error: 'open failed' });
    expect(recentResponse.status).toBe(400);
    expect(await recentResponse.json()).toEqual({ error: 'recent failed' });
    expect(closedResponse.status).toBe(400);
    expect(await closedResponse.json()).toEqual({ error: 'closed failed' });
  });
});

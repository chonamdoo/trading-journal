import { describe, expect, it } from 'vitest';

import { mapTradeRowToTrade } from './data/mappers/trade.mapper';
import { tradeReturnPct } from './domain/entities/trade';

describe('Trades feature tracer bullet', () => {
  it('maps numeric Trade row values and exposes Trade return percentage', () => {
    const trade = mapTradeRowToTrade({
      id: 'trade-1',
      user_id: 'user-1',
      date: '2026-05-05',
      entry_datetime: '2026-05-05T01:00:00Z',
      exit_datetime: '2026-05-05T02:00:00Z',
      asset: 'BTC',
      direction: 'LONG',
      leverage: 10,
      entry_price: '100000.00',
      exit_price: '101000.00',
      stop_loss_price: null,
      margin: '100.00',
      status: 'closed',
      pnl: '10.00',
      reason: 'breakout',
      notes: 'followed plan',
      tags: ['breakout'],
      emotion: 'calm',
      created_at: '2026-05-05T01:00:00Z',
      updated_at: '2026-05-05T02:00:00Z',
    });

    expect(trade.margin).toBe(100);
    expect(trade.tradingPnl).toBe(10);
    expect(tradeReturnPct(trade)).toBe(10);
  });
});

import { describe, expect, it } from 'vitest';

import { calcPnL } from '@/lib/calc';
import { tradesToCsv } from '@/lib/csv-export';
import type { Trade } from '@/types';

describe('funding fee trade PNL behavior', () => {
  it('keeps Trading Fee separate and applies Funding Fee as a signed amount', () => {
    const trade: Trade = {
      id: 'trade-1',
      date: '2026-05-07',
      asset: 'BTC',
      direction: 'LONG',
      leverage: 10,
      entry_price: 100,
      exit_price: 110,
      margin: 100,
      status: 'closed',
      fee: 7,
      funding_fee: -3,
    };

    expect(calcPnL(trade)).toBe(90);
  });

  it('adds received Funding Fee to Realized PNL', () => {
    const trade: Trade = {
      id: 'trade-1',
      date: '2026-05-07',
      asset: 'BTC',
      direction: 'SHORT',
      leverage: 10,
      entry_price: 100,
      exit_price: 90,
      margin: 100,
      status: 'closed',
      fee: 5,
      funding_fee: 4,
    };

    expect(calcPnL(trade)).toBe(99);
  });

  it('exports Trading Fee and Funding Fee as separate CSV columns', () => {
    const csv = tradesToCsv([{
      id: 'trade-1',
      date: '2026-05-07',
      asset: 'BTC',
      direction: 'LONG',
      leverage: 10,
      entry_price: 100,
      exit_price: 110,
      margin: 100,
      status: 'closed',
      pnl: 90,
      fee: 7,
      funding_fee: -3,
    }]);

    expect(csv).toContain('트레이딩피USDT,펀딩피USDT');
    expect(csv).toContain('90,90.00,7,-3');
  });
});

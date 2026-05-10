import { describe, expect, it } from 'vitest';

import { curCapital, totalReturnPct, tradingBase } from '@/lib/calc';
import type { Deposit, Trade } from '@/types';

const closedTrade: Trade = {
  id: 'trade-1',
  date: '2026-05-10',
  asset: 'BTC',
  direction: 'LONG',
  leverage: 10,
  entry_price: 100,
  exit_price: 110,
  margin: 100,
  status: 'closed',
  pnl: 100,
};

describe('capital flow return behavior', () => {
  it('keeps withdrawals out of total asset return while reflecting them in current capital', () => {
    const deposits: Deposit[] = [
      { id: 'deposit-1', date: '2026-05-01', amount: 500 },
      { id: 'withdrawal-1', date: '2026-05-09', amount: -300 },
    ];

    expect(curCapital(1000, deposits, [closedTrade])).toBe(1300);
    expect(tradingBase(1000, deposits)).toBe(1500);
    expect(totalReturnPct([closedTrade], 1000, deposits)).toBeCloseTo(6.6667);
  });
});

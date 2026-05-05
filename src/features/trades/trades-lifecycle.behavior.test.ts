import { describe, expect, it } from 'vitest';

import {
  calcCloseTradingPnl,
  calcClosedMargin,
  calcRealizedTradingPnl,
  calcRemainingMargin,
  calcTotalMargin,
  calcWeightedAverageEntryPrice,
  isFullyClosed,
} from './domain/entities/trade-lifecycle';
import type { Close } from './domain/entities/close';
import type { ScaleIn } from './domain/entities/scale-in';

describe('Trades lifecycle behavior', () => {
  it('keeps Scale-In semantics while calculating remaining Margin and Close Trading PnL', () => {
    const scaleIns: ScaleIn[] = [
      {
        id: 'scale-in-1',
        tradeId: 'trade-1',
        entryPrice: 90,
        margin: 50,
        entryDatetime: '2026-05-05T02:00:00Z',
        type: 'averaging-down',
      },
      {
        id: 'scale-in-2',
        tradeId: 'trade-1',
        entryPrice: 110,
        margin: 25,
        entryDatetime: '2026-05-05T03:00:00Z',
        type: 'pyramiding',
      },
    ];
    const closes: Close[] = [
      {
        id: 'close-1',
        tradeId: 'trade-1',
        exitPrice: 110,
        exitDatetime: '2026-05-05T04:00:00Z',
        quantityPct: 50,
        closeMargin: 75,
        tradingPnl: 11.25,
      },
    ];

    const weightedAverageEntryPrice = calcWeightedAverageEntryPrice(100, 100, scaleIns);

    expect(scaleIns.map((scaleIn) => scaleIn.type)).toEqual(['averaging-down', 'pyramiding']);
    expect(weightedAverageEntryPrice).toBeCloseTo(98.5714285714);
    expect(calcTotalMargin(100, scaleIns)).toBe(175);
    expect(calcClosedMargin(closes, 175)).toBe(75);
    expect(calcRemainingMargin(100, scaleIns, closes)).toBe(100);
    expect(calcCloseTradingPnl(75, 10, 'LONG', 110, weightedAverageEntryPrice)).toBe(86.96);
    expect(calcRealizedTradingPnl(closes)).toBe(11.25);
    expect(isFullyClosed(100, scaleIns, closes)).toBe(false);
  });

  it('treats a Close without closeMargin as a quantity percentage of total Margin', () => {
    const closes: Close[] = [
      {
        id: 'close-1',
        tradeId: 'trade-1',
        exitPrice: 120,
        exitDatetime: '2026-05-05T04:00:00Z',
        quantityPct: 100,
        tradingPnl: 20,
      },
    ];

    expect(calcClosedMargin(closes, 100)).toBe(100);
    expect(calcRemainingMargin(100, [], closes)).toBe(0);
    expect(isFullyClosed(100, [], closes)).toBe(true);
  });
});

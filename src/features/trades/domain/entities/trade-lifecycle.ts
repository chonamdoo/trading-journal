import type { PositionDirection } from './trade';
import type { Close } from './close';
import type { ScaleIn } from './scale-in';

const MARGIN_TOLERANCE = 0.01;

export function calcWeightedAverageEntryPrice(
  initialMargin: number,
  initialPrice: number,
  scaleIns: Pick<ScaleIn, 'margin' | 'entryPrice'>[],
): number {
  const totalMargin = calcTotalMargin(initialMargin, scaleIns);
  if (totalMargin <= 0) return initialPrice;

  const weightedSum = initialMargin * initialPrice
    + scaleIns.reduce((sum, scaleIn) => sum + scaleIn.margin * scaleIn.entryPrice, 0);

  return weightedSum / totalMargin;
}

export function calcTotalMargin(
  initialMargin: number,
  scaleIns: Pick<ScaleIn, 'margin'>[],
): number {
  return initialMargin + scaleIns.reduce((sum, scaleIn) => sum + scaleIn.margin, 0);
}

export function calcClosedMargin(
  closes: Pick<Close, 'closeMargin' | 'quantityPct'>[],
  totalMargin: number,
): number {
  return closes.reduce((sum, close) => {
    if (close.closeMargin != null) return sum + close.closeMargin;
    return sum + (totalMargin * close.quantityPct / 100);
  }, 0);
}

export function calcRemainingMargin(
  initialMargin: number,
  scaleIns: Pick<ScaleIn, 'margin'>[],
  closes: Pick<Close, 'closeMargin' | 'quantityPct'>[],
): number {
  const totalMargin = calcTotalMargin(initialMargin, scaleIns);
  const closedMargin = calcClosedMargin(closes, totalMargin);
  return Math.max(0, totalMargin - closedMargin);
}

export function calcCloseTradingPnl(
  closeMargin: number,
  leverage: number,
  positionDirection: PositionDirection,
  exitPrice: number,
  weightedAverageEntryPrice: number,
): number {
  if (weightedAverageEntryPrice <= 0) return 0;

  const positionValue = closeMargin * leverage;
  const ratio = positionDirection === 'LONG'
    ? (exitPrice - weightedAverageEntryPrice) / weightedAverageEntryPrice
    : (weightedAverageEntryPrice - exitPrice) / weightedAverageEntryPrice;

  return Number((positionValue * ratio).toFixed(2));
}

export function isFullyClosed(
  initialMargin: number,
  scaleIns: Pick<ScaleIn, 'margin'>[],
  closes: Pick<Close, 'closeMargin' | 'quantityPct'>[],
): boolean {
  return calcRemainingMargin(initialMargin, scaleIns, closes) <= MARGIN_TOLERANCE;
}

export function calcRealizedTradingPnl(closes: Pick<Close, 'tradingPnl'>[]): number {
  return closes.reduce((sum, close) => sum + close.tradingPnl, 0);
}

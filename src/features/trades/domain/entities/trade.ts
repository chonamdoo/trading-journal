export type PositionDirection = 'LONG' | 'SHORT';

export type TradeStatus = 'open' | 'closed';

export type TradeEmotion = 'calm' | 'confident' | 'fomo' | 'revenge' | 'anxious';

export type TradeSource = 'manual' | 'exchange' | 'csv';

export type ImportStatus = 'draft' | 'confirmed';

export interface Trade {
  id: string;
  userId?: string;
  date: string;
  entryDatetime?: string | null;
  exitDatetime?: string | null;
  asset: string;
  positionDirection: PositionDirection;
  leverage: number;
  entryPrice: number;
  exitPrice?: number | null;
  stopLossPrice?: number | null;
  margin: number;
  status: TradeStatus;
  tradingPnl?: number | null;
  tradeRationale?: string | null;
  tradeReview?: string | null;
  tradeTags?: string[] | null;
  tradeEmotion?: TradeEmotion | null;
  tradeSource?: TradeSource | null;
  importStatus?: ImportStatus | null;
  createdAt?: string;
  updatedAt?: string;
}

export function tradeReturnPct(trade: Pick<Trade, 'tradingPnl' | 'margin'>): number | null {
  if (trade.tradingPnl == null || trade.margin === 0) return null;
  return (trade.tradingPnl / trade.margin) * 100;
}

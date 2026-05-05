export interface Close {
  id: string;
  tradeId: string;
  userId?: string;
  exitPrice: number;
  exitDatetime: string;
  quantityPct: number;
  closeMargin?: number;
  tradingPnl: number;
  createdAt?: string;
}

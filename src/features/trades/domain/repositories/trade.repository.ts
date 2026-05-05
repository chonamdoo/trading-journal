import type { Trade } from '../entities/trade';

export interface TradeRepository {
  findById(id: string): Promise<Trade | null>;
}

import type { TradeRepository } from '../repositories/trade.repository';

export function createGetTradeUseCase(repository: TradeRepository) {
  return {
    execute(id: string) {
      return repository.findById(id);
    },
  };
}

import { normalizeAssetSymbol } from '../entities/asset';
import type { CustomAssetRepository } from '../repositories/asset.repository';

export function createAddCustomAssetUseCase({
  supportedSymbols,
  customAssetRepository,
}: {
  supportedSymbols: readonly string[];
  customAssetRepository: CustomAssetRepository;
}) {
  return {
    async execute({ userId, symbol }: { userId: string; symbol: string }) {
      const normalizedSymbol = normalizeAssetSymbol(symbol);
      if (!normalizedSymbol) throw new Error('코인 심볼을 입력해주세요.');
      if (supportedSymbols.includes(normalizedSymbol)) {
        throw new Error(`${normalizedSymbol}은(는) 기본 제공 코인입니다.`);
      }
      return customAssetRepository.create(userId, normalizedSymbol);
    },
  };
}

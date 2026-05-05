import { DomainValidationError } from '../errors/domain-validation.error';
import { normalizeAssetSymbol } from '../entities/asset';
import type { FavoriteAssetRepository } from '../repositories/asset.repository';

const MAX_SYMBOL_LEN = 20;

export function createToggleFavoriteAssetUseCase(favoriteAssetRepository: FavoriteAssetRepository) {
  return {
    execute({ userId, symbol }: { userId: string; symbol: string }) {
      const normalizedSymbol = normalizeAssetSymbol(symbol);
      if (!normalizedSymbol) throw new DomainValidationError('심볼을 입력해주세요.');
      if (normalizedSymbol.length > MAX_SYMBOL_LEN) {
        throw new DomainValidationError(`심볼은 최대 ${MAX_SYMBOL_LEN}자입니다.`);
      }

      return favoriteAssetRepository.toggleFavorite(userId, normalizedSymbol);
    },
  };
}

import { normalizeAssetSymbol } from '../entities/asset';
import type { FavoriteAssetRepository } from '../repositories/asset.repository';

const MAX_SYMBOL_LEN = 20;

export function createSetFavoriteAssetUseCase(favoriteAssetRepository: FavoriteAssetRepository) {
  return {
    execute({ userId, symbol, favorited }: { userId: string; symbol: string; favorited: boolean }) {
      const normalizedSymbol = normalizeAssetSymbol(symbol);
      if (!normalizedSymbol) throw new Error('심볼을 입력해주세요.');
      if (normalizedSymbol.length > MAX_SYMBOL_LEN) {
        throw new Error(`심볼은 최대 ${MAX_SYMBOL_LEN}자입니다.`);
      }

      return favoriteAssetRepository.setFavorite(userId, normalizedSymbol, favorited);
    },
  };
}

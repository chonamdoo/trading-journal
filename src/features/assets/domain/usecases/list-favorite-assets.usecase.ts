import type { FavoriteAssetRepository } from '../repositories/asset.repository';

export function createListFavoriteAssetsUseCase(favoriteAssetRepository: FavoriteAssetRepository) {
  return {
    execute({ userId }: { userId: string }) {
      return favoriteAssetRepository.findSymbolsByUser(userId);
    },
  };
}

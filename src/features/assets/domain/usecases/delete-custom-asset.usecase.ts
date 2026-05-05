import type { CustomAssetRepository } from '../repositories/asset.repository';

export function createDeleteCustomAssetUseCase(customAssetRepository: CustomAssetRepository) {
  return {
    execute({ assetId }: { assetId: string }) {
      return customAssetRepository.delete(assetId);
    },
  };
}

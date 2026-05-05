import type { CustomAssetRepository } from '../repositories/asset.repository';

export function createListCustomAssetsUseCase(customAssetRepository: CustomAssetRepository) {
  return {
    execute({ userId }: { userId: string }) {
      return customAssetRepository.findManyByUser(userId);
    },
  };
}

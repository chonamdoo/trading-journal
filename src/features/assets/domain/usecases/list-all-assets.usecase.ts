import { combineAssets } from '../entities/asset';
import type { CustomAssetRepository } from '../repositories/asset.repository';

export function createListAllAssetsUseCase({
  supportedSymbols,
  customAssetRepository,
}: {
  supportedSymbols: readonly string[];
  customAssetRepository: CustomAssetRepository;
}) {
  return {
    async execute({ userId }: { userId: string }) {
      const customAssets = await customAssetRepository.findManyByUser(userId);
      return combineAssets({ supportedSymbols, customAssets });
    },
  };
}

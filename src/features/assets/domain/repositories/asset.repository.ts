import type { CustomAsset } from '../entities/asset';

export type CustomAssetRepository = {
  findManyByUser(userId: string): Promise<CustomAsset[]>;
  create(userId: string, symbol: string): Promise<CustomAsset>;
  delete(assetId: string): Promise<void>;
};

export type FavoriteAssetRepository = {
  findSymbolsByUser(userId: string): Promise<string[]>;
  setFavorite(userId: string, symbol: string, favorited: boolean): Promise<{ favorited: boolean }>;
};

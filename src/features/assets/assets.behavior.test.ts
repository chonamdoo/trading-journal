import { describe, expect, it } from 'vitest';

import { combineAssets, createFavoriteAsset, normalizeAssetSymbol } from './domain/entities/asset';
import { createAddCustomAssetUseCase } from './domain/usecases/add-custom-asset.usecase';

describe('Assets feature module', () => {
  it('keeps Supported Asset, Custom Asset, and Favorite Asset distinct', () => {
    const assets = combineAssets({
      supportedSymbols: ['BTC', 'ETH'],
      customAssets: [
        {
          id: 'custom-1',
          userId: 'user-1',
          symbol: 'DOGE',
          createdAt: '2026-05-06T00:00:00Z',
        },
      ],
    });
    const favorite = createFavoriteAsset('doge');

    expect(assets).toEqual(['BTC', 'ETH', 'DOGE']);
    expect(favorite).toEqual({ symbol: 'DOGE', favorited: true });
  });

  it('rejects Custom Asset creation when the symbol is already a Supported Asset', async () => {
    const addCustomAsset = createAddCustomAssetUseCase({
      supportedSymbols: ['BTC'],
      customAssetRepository: {
        async findManyByUser() {
          return [];
        },
        async create() {
          throw new Error('should not create supported asset as custom asset');
        },
        async delete() {},
      },
    });

    await expect(addCustomAsset.execute({ userId: 'user-1', symbol: ' btc ' }))
      .rejects.toThrow('BTC은(는) 기본 제공 코인입니다.');
  });

  it('normalizes Asset symbols for Custom and Favorite Assets', () => {
    expect(normalizeAssetSymbol(' eth ')).toBe('ETH');
  });
});

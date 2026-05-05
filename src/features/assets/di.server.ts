import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { DEFAULT_ASSETS } from '@/lib/constants';
import type { Database } from '@/lib/supabase/types';
import {
  SupabaseCustomAssetRepository,
  SupabaseFavoriteAssetRepository,
} from './data/repositories/supabase-asset.repository.server';
import { createAddCustomAssetUseCase } from './domain/usecases/add-custom-asset.usecase';
import { createDeleteCustomAssetUseCase } from './domain/usecases/delete-custom-asset.usecase';
import { createListAllAssetsUseCase } from './domain/usecases/list-all-assets.usecase';
import { createListCustomAssetsUseCase } from './domain/usecases/list-custom-assets.usecase';
import { createListFavoriteAssetsUseCase } from './domain/usecases/list-favorite-assets.usecase';
import { createSetFavoriteAssetUseCase } from './domain/usecases/set-favorite-asset.usecase';
import { createToggleFavoriteAssetUseCase } from './domain/usecases/toggle-favorite-asset.usecase';

export function createAssetsCompositionRoot(supabase: SupabaseClient<Database>) {
  const customAssetRepository = new SupabaseCustomAssetRepository(supabase);
  const favoriteAssetRepository = new SupabaseFavoriteAssetRepository(supabase);

  return {
    addCustomAsset: createAddCustomAssetUseCase({
      supportedSymbols: DEFAULT_ASSETS,
      customAssetRepository,
    }),
    deleteCustomAsset: createDeleteCustomAssetUseCase(customAssetRepository),
    listAllAssets: createListAllAssetsUseCase({
      supportedSymbols: DEFAULT_ASSETS,
      customAssetRepository,
    }),
    listCustomAssets: createListCustomAssetsUseCase(customAssetRepository),
    listFavoriteAssets: createListFavoriteAssetsUseCase(favoriteAssetRepository),
    setFavoriteAsset: createSetFavoriteAssetUseCase(favoriteAssetRepository),
    toggleFavoriteAsset: createToggleFavoriteAssetUseCase(favoriteAssetRepository),
  };
}

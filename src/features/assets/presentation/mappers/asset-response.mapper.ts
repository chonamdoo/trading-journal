import type { CustomAssetRow } from '@/lib/supabase/types';

import type { CustomAsset } from '../../domain/entities/asset';

export function mapCustomAssetToResponse(asset: CustomAsset): CustomAssetRow {
  return {
    id: asset.id,
    user_id: asset.userId,
    symbol: asset.symbol,
    created_at: asset.createdAt,
  };
}

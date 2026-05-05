import type { CustomAsset } from '../../domain/entities/asset';
import type { CustomAssetRowDto } from '../dto/custom-asset-row.dto';

export function mapCustomAssetRowToCustomAsset(row: CustomAssetRowDto): CustomAsset {
  return {
    type: 'custom',
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    createdAt: row.created_at,
  };
}

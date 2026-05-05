import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';
import type { CustomAsset } from '../../domain/entities/asset';
import type {
  CustomAssetRepository,
  FavoriteAssetRepository,
} from '../../domain/repositories/asset.repository';
import type { CustomAssetRowDto } from '../dto/custom-asset-row.dto';
import { mapCustomAssetRowToCustomAsset } from '../mappers/asset.mapper';

type Client = SupabaseClient<Database>;

export class SupabaseCustomAssetRepository implements CustomAssetRepository {
  constructor(private readonly supabase: Client) {}

  async findManyByUser(userId: string): Promise<CustomAsset[]> {
    const { data, error } = await this.supabase
      .from('custom_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return ((data ?? []) as CustomAssetRowDto[]).map(mapCustomAssetRowToCustomAsset);
  }

  async create(userId: string, symbol: string): Promise<CustomAsset> {
    const { data, error } = await this.supabase
      .from('custom_assets')
      .insert({ user_id: userId, symbol })
      .select()
      .single();

    if (error?.code === '23505') throw new Error(`${symbol}은(는) 이미 추가된 코인입니다.`);
    if (error) throw new Error(error.message);

    return mapCustomAssetRowToCustomAsset(data as CustomAssetRowDto);
  }

  async delete(assetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('custom_assets')
      .delete()
      .eq('id', assetId);

    if (error) throw new Error(error.message);
  }
}

export class SupabaseFavoriteAssetRepository implements FavoriteAssetRepository {
  constructor(private readonly supabase: Client) {}

  async findSymbolsByUser(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('favorites')
      .select('symbol')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => row.symbol as string);
  }

  async setFavorite(
    userId: string,
    symbol: string,
    favorited: boolean,
  ): Promise<{ favorited: boolean }> {
    if (favorited) {
      const { error } = await this.supabase
        .from('favorites')
        .upsert(
          { user_id: userId, symbol },
          { onConflict: 'user_id,symbol', ignoreDuplicates: true },
        );
      if (error) throw new Error(error.message);
      return { favorited: true };
    }

    const { error } = await this.supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol);
    if (error) throw new Error(error.message);
    return { favorited: false };
  }
}

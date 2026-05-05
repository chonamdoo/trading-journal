import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';
import type { TradeRepository } from '../../domain/repositories/trade.repository';
import type { Trade } from '../../domain/entities/trade';
import type { TradeRowDto } from '../dto/trade-row.dto';
import { mapTradeRowToTrade } from '../mappers/trade.mapper';

type Client = SupabaseClient<Database>;

export class SupabaseTradeRepository implements TradeRepository {
  constructor(private readonly supabase: Client) {}

  async findById(id: string): Promise<Trade | null> {
    const { data, error } = await this.supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return mapTradeRowToTrade(data as TradeRowDto);
  }
}

import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';
import { SupabaseTradeRepository } from './data/repositories/supabase-trade.repository.server';
import { createGetTradeUseCase } from './domain/usecases/get-trade.usecase';

export function createTradesCompositionRoot(supabase: SupabaseClient<Database>) {
  const tradeRepository = new SupabaseTradeRepository(supabase);

  return {
    getTrade: createGetTradeUseCase(tradeRepository),
  };
}

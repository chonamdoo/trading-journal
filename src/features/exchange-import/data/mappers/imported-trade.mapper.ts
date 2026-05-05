import type { TradeSource as TradeInsertSource } from '@/lib/supabase/types';

import { mapTradeSourceForPersistence } from '../../domain/entities/imported-trade';
import type { TradeSource } from '../../domain/entities/imported-trade';

export function mapImportedTradeSourceToTradeInsertSource(
  source: TradeSource,
): TradeInsertSource {
  return mapTradeSourceForPersistence(source);
}

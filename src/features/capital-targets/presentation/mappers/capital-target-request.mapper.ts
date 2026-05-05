import type { TargetUpdate } from '@/lib/supabase/types';

import type { CapitalTargetUpdate } from '../../domain/entities/capital-target';

export function mapTargetUpdateRequest(update: TargetUpdate): CapitalTargetUpdate {
  const mapped: CapitalTargetUpdate = {
    label: update.label,
    amount: update.amount,
    sortOrder: update.sort_order,
  };

  return Object.fromEntries(
    Object.entries(mapped).filter(([, value]) => value !== undefined),
  ) as CapitalTargetUpdate;
}

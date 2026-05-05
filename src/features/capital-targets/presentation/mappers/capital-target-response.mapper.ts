import type { TargetRow } from '@/lib/supabase/types';

import type { CapitalTarget } from '../../domain/entities/capital-target';

export function mapCapitalTargetToResponse(target: CapitalTarget): TargetRow {
  return {
    id: target.id,
    user_id: target.userId,
    label: target.label,
    amount: target.amount,
    sort_order: target.sortOrder,
    created_at: target.createdAt,
  };
}

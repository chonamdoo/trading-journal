import { createCapitalTarget } from '../../domain/entities/capital-target';
import type { CapitalTarget } from '../../domain/entities/capital-target';
import type { CapitalTargetRowDto } from '../dto/capital-target-row.dto';

export function mapTargetRowToCapitalTarget(row: CapitalTargetRowDto): CapitalTarget {
  return createCapitalTarget({
    id: row.id,
    userId: row.user_id,
    label: row.label,
    amount: row.amount,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  });
}

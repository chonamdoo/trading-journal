export type CapitalTarget = {
  kind: 'capital-target';
  id: string;
  userId: string;
  label: string;
  amount: number;
  sortOrder: number;
  createdAt: string;
};

export type CapitalTargetUpdate = {
  label?: string;
  amount?: number;
  sortOrder?: number;
};

export function createCapitalTarget({
  id,
  userId,
  label,
  amount,
  sortOrder,
  createdAt,
}: Omit<CapitalTarget, 'kind'>): CapitalTarget {
  return {
    kind: 'capital-target',
    id,
    userId,
    label,
    amount,
    sortOrder,
    createdAt,
  };
}

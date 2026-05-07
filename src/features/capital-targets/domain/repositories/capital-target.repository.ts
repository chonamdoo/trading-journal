import type { CapitalTarget, CapitalTargetUpdate } from '../entities/capital-target';

export type CapitalTargetRepository = {
  findManyByUser(userId: string): Promise<CapitalTarget[]>;
  create(userId: string, label: string, amount: number): Promise<CapitalTarget>;
  update(targetId: string, update: CapitalTargetUpdate): Promise<CapitalTarget>;
  reorder(userId: string, targetIds: string[]): Promise<void>;
  delete(targetId: string): Promise<void>;
};

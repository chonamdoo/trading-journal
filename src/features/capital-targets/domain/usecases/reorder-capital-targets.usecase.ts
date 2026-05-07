import type { CapitalTargetRepository } from '../repositories/capital-target.repository';

export function createReorderCapitalTargetsUseCase(capitalTargetRepository: CapitalTargetRepository) {
  return {
    execute({ userId, targetIds }: { userId: string; targetIds: string[] }) {
      return capitalTargetRepository.reorder(userId, targetIds);
    },
  };
}

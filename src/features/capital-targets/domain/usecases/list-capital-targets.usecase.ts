import type { CapitalTargetRepository } from '../repositories/capital-target.repository';

export function createListCapitalTargetsUseCase(capitalTargetRepository: CapitalTargetRepository) {
  return {
    execute({ userId }: { userId: string }) {
      return capitalTargetRepository.findManyByUser(userId);
    },
  };
}

import type { CapitalTargetRepository } from '../repositories/capital-target.repository';

export function createDeleteCapitalTargetUseCase(capitalTargetRepository: CapitalTargetRepository) {
  return {
    execute({ targetId }: { targetId: string }) {
      return capitalTargetRepository.delete(targetId);
    },
  };
}

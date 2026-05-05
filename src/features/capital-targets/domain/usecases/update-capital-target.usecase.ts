import type { CapitalTargetUpdate } from '../entities/capital-target';
import type { CapitalTargetRepository } from '../repositories/capital-target.repository';

export function createUpdateCapitalTargetUseCase(capitalTargetRepository: CapitalTargetRepository) {
  return {
    execute({ targetId, update }: { targetId: string; update: CapitalTargetUpdate }) {
      return capitalTargetRepository.update(targetId, update);
    },
  };
}

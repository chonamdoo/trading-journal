import type { CapitalTargetRepository } from '../repositories/capital-target.repository';

export function createCreateCapitalTargetUseCase(capitalTargetRepository: CapitalTargetRepository) {
  return {
    execute({ userId, label, amount }: { userId: string; label: string; amount: number }) {
      return capitalTargetRepository.create(userId, label, amount);
    },
  };
}

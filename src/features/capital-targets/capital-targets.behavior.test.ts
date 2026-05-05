import { describe, expect, it } from 'vitest';

import { createCapitalTarget } from './domain/entities/capital-target';
import { createListCapitalTargetsUseCase } from './domain/usecases/list-capital-targets.usecase';

describe('Capital Targets feature module', () => {
  it('keeps Capital Target separate from Target Price', () => {
    const target = createCapitalTarget({
      id: 'target-1',
      userId: 'user-1',
      label: '1차 계좌 목표',
      amount: 10_000,
      sortOrder: 0,
      createdAt: '2026-05-06T00:00:00Z',
    });

    expect(target.kind).toBe('capital-target');
    expect(target.amount).toBe(10_000);
    expect('targetPrice' in target).toBe(false);
  });

  it('loads Capital Targets by authenticated user id', async () => {
    const calls: string[] = [];
    const listCapitalTargets = createListCapitalTargetsUseCase({
      async findManyByUser(userId) {
        calls.push(userId);
        return [];
      },
      async create() {
        throw new Error('not used');
      },
      async update() {
        throw new Error('not used');
      },
      async delete() {},
    });

    await listCapitalTargets.execute({ userId: 'user-1' });

    expect(calls).toEqual(['user-1']);
  });
});

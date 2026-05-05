import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/targets/route';

const listCapitalTargets = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  withAuth: async (_req: NextRequest, handler: (supabase: unknown, userId: string) => Promise<Response>) => {
    return handler({ from: vi.fn() }, 'user-1');
  },
}));

vi.mock('@/features/capital-targets/di.server', () => ({
  createCapitalTargetsCompositionRoot: () => ({
    listCapitalTargets: {
      execute: listCapitalTargets,
    },
  }),
}));

describe('GET /api/targets', () => {
  beforeEach(() => {
    listCapitalTargets.mockReset();
  });

  it('lists Capital Targets through the Capital Targets Composition Root', async () => {
    listCapitalTargets.mockResolvedValue([
      {
        kind: 'capital-target',
        id: 'target-1',
        userId: 'user-1',
        label: '1차 계좌 목표',
        amount: 10000,
        sortOrder: 0,
        createdAt: '2026-05-06T00:00:00Z',
      },
    ]);

    const response = await GET(new NextRequest('http://localhost/api/targets'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(listCapitalTargets).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(body.data[0]).toEqual({
      id: 'target-1',
      user_id: 'user-1',
      label: '1차 계좌 목표',
      amount: 10000,
      sort_order: 0,
      created_at: '2026-05-06T00:00:00Z',
    });
  });
});

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/assets/route';

const listAllAssets = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  withAuth: async (_req: NextRequest, handler: (supabase: unknown, userId: string) => Promise<Response>) => {
    return handler({ from: vi.fn() }, 'user-1');
  },
}));

vi.mock('@/features/assets/di.server', () => ({
  createAssetsCompositionRoot: () => ({
    listAllAssets: {
      execute: listAllAssets,
    },
  }),
}));

describe('GET /api/assets', () => {
  beforeEach(() => {
    listAllAssets.mockReset();
  });

  it('lists Assets through the Assets Composition Root', async () => {
    listAllAssets.mockResolvedValue(['BTC', 'DOGE']);

    const response = await GET(new NextRequest('http://localhost/api/assets'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(listAllAssets).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(body).toEqual({ success: true, data: ['BTC', 'DOGE'] });
  });
});

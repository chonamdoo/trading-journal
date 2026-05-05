import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/favorites/toggle/route';

const toggleFavorite = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  withAuth: async (_req: NextRequest, handler: (supabase: unknown, userId: string) => Promise<Response>) => {
    return handler({ from: vi.fn() }, 'user-1');
  },
}));

vi.mock('@/features/assets/di.server', () => ({
  createAssetsCompositionRoot: () => ({
    toggleFavoriteAsset: {
      execute: toggleFavorite,
    },
  }),
}));

describe('POST /api/favorites/toggle', () => {
  beforeEach(() => {
    toggleFavorite.mockReset();
  });

  it('toggles a normalized favorite symbol for the authenticated user', async () => {
    toggleFavorite.mockResolvedValue({ favorited: true, id: 'favorite-1' });

    const response = await POST(new NextRequest('http://localhost/api/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ symbol: ' btc ' }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(toggleFavorite).toHaveBeenCalledWith({ userId: 'user-1', symbol: ' btc ' });
    expect(body).toEqual({
      success: true,
      data: { favorited: true, id: 'favorite-1' },
    });
  });

  it('rejects a missing symbol', async () => {
    const response = await POST(new NextRequest('http://localhost/api/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({}),
    }));

    expect(response.status).toBe(400);
    expect(toggleFavorite).not.toHaveBeenCalled();
  });

  it('hides unexpected server errors from the public response', async () => {
    toggleFavorite.mockRejectedValue(new Error('database connection leaked detail'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(new NextRequest('http://localhost/api/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ symbol: 'BTC' }),
    }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: '서버 오류가 발생했습니다.' });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});

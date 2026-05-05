import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/mobile/profile/route';

const getUserProfile = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  withAuth: async (_req: NextRequest, handler: (supabase: unknown, userId: string) => Promise<Response>) => {
    return handler({ from: vi.fn() }, 'auth-user-1');
  },
}));

vi.mock('@/features/user-profile/di.server', () => ({
  createUserProfileCompositionRoot: () => ({
    getUserProfile: {
      execute: getUserProfile,
    },
  }),
}));

describe('/api/mobile/profile Route Adapter', () => {
  beforeEach(() => {
    getUserProfile.mockReset();
  });

  it('keeps the mobile plain Profile response shape', async () => {
    getUserProfile.mockResolvedValue({
      authUserId: 'auth-user-1',
      email: 'local-user@example.test',
      displayName: 'Local User',
      initialCapital: 1000,
      currency: 'USD',
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      createdAt: '2026-05-06T00:00:00Z',
      updatedAt: '2026-05-06T00:00:00Z',
    });

    const response = await GET(new NextRequest('http://localhost/api/mobile/profile'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getUserProfile).toHaveBeenCalledWith({ authUserId: 'auth-user-1' });
    expect(body).toEqual({
      id: 'auth-user-1',
      email: 'local-user@example.test',
      display_name: 'Local User',
      initial_capital: 1000,
      currency: 'USD',
      subscription_tier: 'free',
      subscription_expires_at: null,
      created_at: '2026-05-06T00:00:00Z',
      updated_at: '2026-05-06T00:00:00Z',
    });
  });
});

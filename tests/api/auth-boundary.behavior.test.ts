import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const bearerClient = {
    auth: {
      getUser: vi.fn(),
    },
  };
  const cookieClient = {
    auth: {
      getUser: vi.fn(),
    },
  };

  return {
    bearerClient,
    cookieClient,
    createMobileClient: vi.fn(() => bearerClient),
    createServerClient: vi.fn(() => Promise.resolve(cookieClient)),
  };
});

vi.mock('@/lib/supabase/mobile-server', () => ({
  createMobileClient: mocks.createMobileClient,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createServerClient,
}));

describe('unified auth boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bearerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'bearer-user-1' } },
      error: null,
    });
    mocks.cookieClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'cookie-user-1' } },
      error: null,
    });
  });

  it('uses the Bearer token client for Authorization API requests', async () => {
    const { withAuth } = await import('@/lib/api/auth');
    const request = new NextRequest('http://localhost/api/profile', {
      headers: {
        authorization: 'Bearer mobile-token-1',
        'x-real-ip': 'auth-boundary-bearer',
      },
    });

    const response = await withAuth(
      request,
      async (_supabase, userId) => NextResponse.json({ userId }),
      { windowMs: 60_000, maxRequests: 10 },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.createMobileClient).toHaveBeenCalledWith('mobile-token-1');
    expect(mocks.createServerClient).not.toHaveBeenCalled();
    expect(body).toEqual({ userId: 'bearer-user-1' });
  });

  it('uses the cookie server client when Authorization is absent', async () => {
    const { withAuth } = await import('@/lib/api/auth');
    const request = new NextRequest('http://localhost/api/profile', {
      headers: {
        'x-real-ip': 'auth-boundary-cookie',
      },
    });

    const response = await withAuth(
      request,
      async (_supabase, userId) => NextResponse.json({ userId }),
      { windowMs: 60_000, maxRequests: 10 },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.createMobileClient).not.toHaveBeenCalled();
    expect(mocks.createServerClient).toHaveBeenCalledTimes(1);
    expect(body).toEqual({ userId: 'cookie-user-1' });
  });

});

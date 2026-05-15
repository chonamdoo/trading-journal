import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const client = {
    auth: {
      getUser: vi.fn(),
    },
  };

  return {
    client,
    createServerClient: vi.fn(() => client),
  };
});

vi.mock('@supabase/ssr', () => ({
  createServerClient: mocks.createServerClient,
}));

async function loadMiddleware() {
  vi.resetModules();
  return import('@/lib/supabase/middleware');
}

describe('/api/calendar middleware boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the economic calendar API public', async () => {
    const { updateSession } = await loadMiddleware();
    const response = await updateSession(new NextRequest('http://localhost/api/calendar'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(mocks.client.auth.getUser).not.toHaveBeenCalled();
  });
});

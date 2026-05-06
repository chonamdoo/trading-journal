import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const auth = {
    getSession: vi.fn(),
    refreshSession: vi.fn(),
  };

  return {
    auth,
    createClient: vi.fn(() => ({ auth })),
  };
});

vi.mock('@/lib/supabase/client', () => ({
  createClient: mocks.createClient,
}));

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('client fetch wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('window', { location: { href: '' } });
    mocks.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'session-token' } },
    });
    mocks.auth.refreshSession.mockResolvedValue({
      data: { session: { access_token: 'refreshed-token' } },
    });
  });

  it('adds the session bearer token to JSON API requests', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 'profile-1' } }));
    const { apiFetch } = await import('@/lib/api/client');

    const result = await apiFetch('/api/profile');

    expect(result).toEqual({ success: true, data: { success: true, data: { id: 'profile-1' } } });
    expect(fetchMock).toHaveBeenCalledWith('/api/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer session-token',
      },
    });
  });

  it('retries once with a refreshed bearer token after a 401 response', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { ok: true } }));
    const { apiFetch } = await import('@/lib/api/client');

    const result = await apiFetch('/api/profile');

    expect(result).toEqual({ success: true, data: { success: true, data: { ok: true } } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith('/api/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer refreshed-token',
      },
    });
  });

  it('redirects to login when refresh cannot recover a 401 response', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401 }));
    mocks.auth.refreshSession.mockResolvedValueOnce({ data: { session: null } });
    const { apiFetch } = await import('@/lib/api/client');

    const result = await apiFetch('/api/profile');

    expect(result).toEqual({
      success: false,
      error: '인증이 만료되었습니다. 다시 로그인해주세요.',
    });
    expect(window.location.href).toBe('/login');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('treats a successful 204 response as a successful empty result', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { apiFetch } = await import('@/lib/api/client');

    const result = await apiFetch<void>('/api/trades/trade-1', { method: 'DELETE' });

    expect(result).toEqual({ success: true, data: undefined });
  });

  it('sends FormData without forcing a JSON content type', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 'shot-1' } }));
    const formData = new FormData();
    formData.set('file', new Blob(['image']), 'trade.png');
    const { apiFetchFormData } = await import('@/lib/api/client');

    const result = await apiFetchFormData('/api/trades/trade-1/screenshots', formData);

    expect(result).toEqual({ success: true, data: { success: true, data: { id: 'shot-1' } } });
    expect(fetchMock).toHaveBeenCalledWith('/api/trades/trade-1/screenshots', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: 'Bearer session-token',
      },
    });
  });
});

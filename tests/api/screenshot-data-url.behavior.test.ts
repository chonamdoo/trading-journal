import { describe, expect, it, vi } from 'vitest';

function createSupabaseMock() {
  const row = {
    id: 'shot-1',
    trade_id: 'trade-1',
    storage_path: 'user-1/trade-1/shot.png',
    mime_type: 'image/png',
  };

  const single = vi.fn().mockResolvedValue({ data: row, error: null });
  const eqSecond = vi.fn(() => ({ single }));
  const eqFirst = vi.fn(() => ({ eq: eqSecond }));
  const select = vi.fn(() => ({ eq: eqFirst }));
  const from = vi.fn(() => ({ select }));
  const download = vi.fn().mockResolvedValue({
    data: new Blob(['image-bytes'], { type: 'image/png' }),
    error: null,
  });
  const storageFrom = vi.fn(() => ({ download }));

  return {
    supabase: {
      from,
      storage: { from: storageFrom },
    },
    single,
    eqFirst,
    eqSecond,
    storageFrom,
    download,
  };
}

describe('screenshot data url API boundary', () => {
  it('loads screenshot metadata by id and trade before returning a data URL', async () => {
    const { getScreenshotDataUrl } = await import('@/lib/api/screenshots');
    const mocks = createSupabaseMock();

    const result = await getScreenshotDataUrl(
      mocks.supabase as never,
      'trade-1',
      'shot-1',
    );

    expect(result).toEqual({
      success: true,
      data: { dataUrl: 'data:image/png;base64,aW1hZ2UtYnl0ZXM=' },
    });
    expect(mocks.eqFirst).toHaveBeenCalledWith('id', 'shot-1');
    expect(mocks.eqSecond).toHaveBeenCalledWith('trade_id', 'trade-1');
    expect(mocks.storageFrom).toHaveBeenCalledWith('trade-screenshots');
    expect(mocks.download).toHaveBeenCalledWith('user-1/trade-1/shot.png');
  });

  it('unwraps screenshot data URL responses in the client API', async () => {
    vi.resetModules();
    vi.doMock('@/lib/api/client', () => ({
      apiFetch: vi.fn().mockResolvedValue({
        success: true,
        data: { success: true, data: { dataUrl: 'data:image/png;base64,abc' } },
      }),
      apiFetchFormData: vi.fn(),
    }));
    const { apiFetch } = await import('@/lib/api/client');
    const { fetchScreenshotDataUrl } = await import('@/lib/api/client-api');

    const result = await fetchScreenshotDataUrl('trade-1', 'shot-1');

    expect(result).toEqual({
      success: true,
      data: { dataUrl: 'data:image/png;base64,abc' },
    });
    expect(apiFetch).toHaveBeenCalledWith('/api/trades/trade-1/screenshots/shot-1/data-url');
  });
});

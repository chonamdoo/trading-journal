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
  it('loads screenshot metadata by id and trade before returning a blob', async () => {
    const { getScreenshotBlob } = await import('@/lib/api/screenshots');
    const mocks = createSupabaseMock();

    const result = await getScreenshotBlob(
      mocks.supabase as never,
      'trade-1',
      'shot-1',
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.mimeType).toBe('image/png');
    expect(await result.data.blob.text()).toBe('image-bytes');
    expect(mocks.eqFirst).toHaveBeenCalledWith('id', 'shot-1');
    expect(mocks.eqSecond).toHaveBeenCalledWith('trade_id', 'trade-1');
    expect(mocks.storageFrom).toHaveBeenCalledWith('trade-screenshots');
    expect(mocks.download).toHaveBeenCalledWith('user-1/trade-1/shot.png');
  });

  it('returns screenshot blobs through the client API', async () => {
    vi.resetModules();
    const blob = new Blob(['image-bytes'], { type: 'image/png' });
    vi.doMock('@/lib/api/client', () => ({
      apiFetch: vi.fn(),
      apiFetchBlob: vi.fn().mockResolvedValue({
        success: true,
        data: blob,
      }),
      apiFetchFormData: vi.fn(),
    }));
    const { apiFetchBlob } = await import('@/lib/api/client');
    const { fetchScreenshotBlob } = await import('@/lib/api/client-api');

    const result = await fetchScreenshotBlob('trade-1', 'shot-1');

    expect(result).toEqual({
      success: true,
      data: blob,
    });
    expect(apiFetchBlob).toHaveBeenCalledWith('/api/trades/trade-1/screenshots/shot-1/download');
  });
});

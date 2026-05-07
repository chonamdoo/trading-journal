import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  apiFetch: mocks.apiFetch,
}));

describe('SPEC-002 utility client fetch wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches deposit total through the utility route', async () => {
    mocks.apiFetch.mockResolvedValueOnce({ success: true, data: { success: true, data: 1500 } });
    const { fetchDepositTotal } = await import('@/lib/api/client-api');

    const result = await fetchDepositTotal();

    expect(result).toEqual({ success: true, data: 1500 });
    expect(mocks.apiFetch).toHaveBeenCalledWith('/api/deposits/total');
  });

  it('sets initial capital through the dedicated profile command route', async () => {
    const profile = { id: 'user-1', initial_capital: 2000 };
    mocks.apiFetch.mockResolvedValueOnce({ success: true, data: { success: true, data: profile } });
    const { fetchSetInitialCapital } = await import('@/lib/api/client-api');

    const result = await fetchSetInitialCapital(2000);

    expect(result).toEqual({ success: true, data: profile });
    expect(mocks.apiFetch).toHaveBeenCalledWith('/api/profile/initial-capital', {
      method: 'PUT',
      body: JSON.stringify({ amount: 2000 }),
    });
  });

  it('fetches onboarding status through the utility route', async () => {
    mocks.apiFetch.mockResolvedValueOnce({ success: true, data: { success: true, data: { completed: true } } });
    const { fetchOnboardingStatus } = await import('@/lib/api/client-api');

    const result = await fetchOnboardingStatus();

    expect(result).toEqual({ success: true, data: { completed: true } });
    expect(mocks.apiFetch).toHaveBeenCalledWith('/api/profile/onboarding');
  });

  it('reorders targets through the utility command route', async () => {
    mocks.apiFetch.mockResolvedValueOnce({ success: true, data: { success: true, data: null } });
    const { fetchReorderTargets } = await import('@/lib/api/client-api');

    const result = await fetchReorderTargets(['target-2', 'target-1']);

    expect(result).toEqual({ success: true, data: undefined });
    expect(mocks.apiFetch).toHaveBeenCalledWith('/api/targets/reorder', {
      method: 'POST',
      body: JSON.stringify({ targetIds: ['target-2', 'target-1'] }),
    });
  });

  it('uses the dedicated initial-capital wrapper in the trade store action', () => {
    const source = readFileSync('src/hooks/useTrades.ts', 'utf8');
    const actionSource = source.slice(
      source.indexOf('setInitialCapital: async'),
      source.indexOf('// ── 커스텀 자산', source.indexOf('setInitialCapital: async')),
    );

    expect(actionSource).toContain('fetchSetInitialCapital(amount)');
    expect(actionSource).not.toContain('fetchUpdateProfile({ initial_capital: amount })');
  });
});

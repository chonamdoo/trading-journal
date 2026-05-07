import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  withAuth: vi.fn(async (_req, handler) => handler({ from: vi.fn() }, 'user-1')),
  getDepositTotal: vi.fn(async () => ({ success: true, data: 1500 })),
  getUserProfile: vi.fn(async () => ({
    authUserId: 'user-1',
    email: 'demo@example.test',
    displayName: null,
    initialCapital: 1000,
    currency: 'USD',
    subscriptionTier: 'free',
    subscriptionExpiresAt: null,
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  })),
  updateUserProfile: vi.fn(async () => ({
    authUserId: 'user-1',
    email: 'demo@example.test',
    displayName: null,
    initialCapital: 2000,
    currency: 'USD',
    subscriptionTier: 'free',
    subscriptionExpiresAt: null,
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  })),
  reorderTargets: vi.fn(async () => ({ success: true, data: undefined })),
}));

vi.mock('@/lib/api/auth', () => ({
  withAuth: mocks.withAuth,
}));

vi.mock('@/lib/api/deposits', () => ({
  getDepositTotal: mocks.getDepositTotal,
}));

vi.mock('@/features/user-profile/di.server', () => ({
  createUserProfileCompositionRoot: () => ({
    getUserProfile: {
      execute: mocks.getUserProfile,
    },
    updateUserProfile: {
      execute: mocks.updateUserProfile,
    },
  }),
}));

vi.mock('@/lib/api/targets', () => ({
  reorderTargets: mocks.reorderTargets,
}));

import * as depositTotalRoute from '@/app/api/deposits/total/route';
import * as initialCapitalRoute from '@/app/api/profile/initial-capital/route';
import * as onboardingRoute from '@/app/api/profile/onboarding/route';
import * as targetReorderRoute from '@/app/api/targets/reorder/route';

describe('SPEC-002 utility route boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.withAuth.mockImplementation(async (_req, handler) => handler({ from: vi.fn() }, 'user-1'));
    mocks.getDepositTotal.mockResolvedValue({ success: true, data: 1500 });
    mocks.getUserProfile.mockResolvedValue({
      authUserId: 'user-1',
      email: 'demo@example.test',
      displayName: null,
      initialCapital: 1000,
      currency: 'USD',
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      createdAt: '2026-05-07T00:00:00.000Z',
      updatedAt: '2026-05-07T00:00:00.000Z',
    });
    mocks.updateUserProfile.mockResolvedValue({
      authUserId: 'user-1',
      email: 'demo@example.test',
      displayName: null,
      initialCapital: 2000,
      currency: 'USD',
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      createdAt: '2026-05-07T00:00:00.000Z',
      updatedAt: '2026-05-07T00:00:00.000Z',
    });
    mocks.reorderTargets.mockResolvedValue({ success: true, data: undefined });
  });

  it('returns the authenticated user deposit total', async () => {
    const response = await depositTotalRoute.GET(new NextRequest('http://localhost/api/deposits/total'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: 1500 });
    expect(mocks.getDepositTotal).toHaveBeenCalledWith(expect.anything(), 'user-1');
  });

  it('updates initial capital through the user profile boundary', async () => {
    const response = await initialCapitalRoute.PUT(new NextRequest('http://localhost/api/profile/initial-capital', {
      method: 'PUT',
      body: JSON.stringify({ amount: 2000 }),
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: expect.objectContaining({ initial_capital: 2000 }),
    });
    expect(mocks.updateUserProfile).toHaveBeenCalledWith({
      authUserId: 'user-1',
      update: { initialCapital: 2000 },
    });
  });

  it('returns onboarding completion from initial capital', async () => {
    const response = await onboardingRoute.GET(new NextRequest('http://localhost/api/profile/onboarding'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: { completed: true } });
    expect(mocks.getUserProfile).toHaveBeenCalledWith({ authUserId: 'user-1' });
  });

  it('reorders capital targets', async () => {
    const response = await targetReorderRoute.POST(new NextRequest('http://localhost/api/targets/reorder', {
      method: 'POST',
      body: JSON.stringify({ targetIds: ['target-2', 'target-1'] }),
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: null });
    expect(mocks.reorderTargets).toHaveBeenCalledWith(expect.anything(), ['target-2', 'target-1'], 'user-1');
  });

  it('rejects malformed target reorder payloads', async () => {
    const response = await targetReorderRoute.POST(new NextRequest('http://localhost/api/targets/reorder', {
      method: 'POST',
      body: JSON.stringify({ targetIds: ['target-1', ''] }),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'targetIds must be an array' });
    expect(mocks.reorderTargets).not.toHaveBeenCalled();
  });

  it('propagates upstream failures', async () => {
    mocks.getDepositTotal.mockResolvedValueOnce({ success: false, error: 'total failed' } as never);
    mocks.updateUserProfile.mockRejectedValueOnce(new Error('capital failed'));
    mocks.getUserProfile.mockRejectedValueOnce(new Error('onboarding failed'));
    mocks.reorderTargets.mockResolvedValueOnce({ success: false, error: 'reorder failed' } as never);

    const depositResponse = await depositTotalRoute.GET(new NextRequest('http://localhost/api/deposits/total'));
    const capitalResponse = await initialCapitalRoute.PUT(new NextRequest('http://localhost/api/profile/initial-capital', {
      method: 'PUT',
      body: JSON.stringify({ amount: 2000 }),
    }));
    const onboardingResponse = await onboardingRoute.GET(new NextRequest('http://localhost/api/profile/onboarding'));
    const reorderResponse = await targetReorderRoute.POST(new NextRequest('http://localhost/api/targets/reorder', {
      method: 'POST',
      body: JSON.stringify({ targetIds: ['target-1'] }),
    }));

    expect(depositResponse.status).toBe(400);
    expect(await depositResponse.json()).toEqual({ error: 'total failed' });
    expect(capitalResponse.status).toBe(400);
    expect(await capitalResponse.json()).toEqual({ error: 'capital failed' });
    expect(onboardingResponse.status).toBe(400);
    expect(await onboardingResponse.json()).toEqual({ error: 'onboarding failed' });
    expect(reorderResponse.status).toBe(400);
    expect(await reorderResponse.json()).toEqual({ error: 'reorder failed' });
  });
});

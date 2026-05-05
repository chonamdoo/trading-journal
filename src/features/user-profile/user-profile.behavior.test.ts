import { describe, expect, it } from 'vitest';

import { mapProfileRowToUserProfile } from './data/mappers/user-profile.mapper';
import { createGetUserProfileUseCase } from './domain/usecases/get-user-profile.usecase';
import { createUpdateUserProfileUseCase } from './domain/usecases/update-user-profile.usecase';

describe('User Profile feature module', () => {
  it('loads a User Profile by authenticated Auth User id', async () => {
    const calls: string[] = [];
    const getUserProfile = createGetUserProfileUseCase({
      async findByAuthUserId(authUserId) {
        calls.push(authUserId);
        return null;
      },
      async updateByAuthUserId() {
        return null;
      },
    });

    await getUserProfile.execute({ authUserId: 'auth-user-1' });

    expect(calls).toEqual(['auth-user-1']);
  });

  it('keeps Auth User identity out of User Profile updates', async () => {
    const updates: unknown[] = [];
    const updateUserProfile = createUpdateUserProfileUseCase({
      async findByAuthUserId() {
        return null;
      },
      async updateByAuthUserId(_authUserId, update) {
        updates.push(update);
        return null;
      },
    });

    await updateUserProfile.execute({
      authUserId: 'auth-user-1',
      update: {
        id: 'attempted-id-change',
        email: 'attempted@example.com',
        displayName: 'Nandoo',
        initialCapital: 1000,
        currency: 'USD',
      },
    });

    expect(updates).toEqual([
      {
        displayName: 'Nandoo',
        initialCapital: 1000,
        currency: 'USD',
      },
    ]);
  });

  it('maps Profile row settings without using production demo account data', () => {
    const profile = mapProfileRowToUserProfile({
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

    expect(profile.authUserId).toBe('auth-user-1');
    expect(profile.email).toBe('local-user@example.test');
    expect(profile.email).not.toBe('demo@mytradelog.app');
    expect(profile.initialCapital).toBe(1000);
  });
});

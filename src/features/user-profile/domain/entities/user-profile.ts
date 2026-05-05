import type { AuthUserId } from './auth-user';

export type SubscriptionTier = 'free' | 'pro';

export type UserProfile = {
  authUserId: AuthUserId;
  email: string;
  displayName: string | null;
  initialCapital: number;
  currency: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserProfileUpdate = {
  id?: string;
  email?: string;
  displayName?: string | null;
  initialCapital?: number;
  currency?: string;
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiresAt?: string | null;
};

export function sanitizeUserProfileUpdate(update: UserProfileUpdate): UserProfileUpdate {
  const sanitized: UserProfileUpdate = {
    displayName: update.displayName,
    initialCapital: update.initialCapital,
    currency: update.currency,
    subscriptionTier: update.subscriptionTier,
    subscriptionExpiresAt: update.subscriptionExpiresAt,
  };

  return Object.fromEntries(
    Object.entries(sanitized).filter(([, value]) => value !== undefined),
  ) as UserProfileUpdate;
}

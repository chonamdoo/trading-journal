import type { ProfileUpdate } from '@/lib/supabase/types';

import type { UserProfileUpdate } from '../../domain/entities/user-profile';

export function mapProfileUpdateRequest(update: ProfileUpdate): UserProfileUpdate {
  return {
    id: update.id,
    email: update.email,
    displayName: update.display_name,
    initialCapital: update.initial_capital,
    currency: update.currency,
    subscriptionTier: update.subscription_tier,
    subscriptionExpiresAt: update.subscription_expires_at,
  };
}

import type { ProfileRow } from '@/lib/supabase/types';

import type { UserProfile } from '../../domain/entities/user-profile';

export function mapUserProfileToProfileResponse(profile: UserProfile): ProfileRow {
  return {
    id: profile.authUserId,
    email: profile.email,
    display_name: profile.displayName,
    initial_capital: profile.initialCapital,
    currency: profile.currency,
    subscription_tier: profile.subscriptionTier,
    subscription_expires_at: profile.subscriptionExpiresAt,
    pre_trade_checklist_items: profile.preTradeChecklistItems,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

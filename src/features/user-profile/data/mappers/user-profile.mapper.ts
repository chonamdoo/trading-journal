import type { ProfileUpdate } from '@/lib/supabase/types';

import type { UserProfile, UserProfileUpdate } from '../../domain/entities/user-profile';
import type { UserProfileRowDto } from '../dto/user-profile-row.dto';

export function mapProfileRowToUserProfile(row: UserProfileRowDto): UserProfile {
  return {
    authUserId: row.id,
    email: row.email,
    displayName: row.display_name,
    initialCapital: row.initial_capital,
    currency: row.currency,
    subscriptionTier: row.subscription_tier,
    subscriptionExpiresAt: row.subscription_expires_at,
    preTradeChecklistItems: row.pre_trade_checklist_items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapUserProfileUpdateToProfileUpdate(update: UserProfileUpdate): ProfileUpdate {
  const mapped: ProfileUpdate = {
    display_name: update.displayName,
    initial_capital: update.initialCapital,
    currency: update.currency,
    subscription_tier: update.subscriptionTier,
    subscription_expires_at: update.subscriptionExpiresAt,
    pre_trade_checklist_items: update.preTradeChecklistItems,
  };

  return Object.fromEntries(
    Object.entries(mapped).filter(([, value]) => value !== undefined),
  ) as ProfileUpdate;
}

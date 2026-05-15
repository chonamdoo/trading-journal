import type { AuthUserId } from './auth-user';

export type SubscriptionTier = 'free' | 'pro';

export type PreTradeChecklistItem = {
  id: string;
  label: string;
};

const PRE_TRADE_CHECKLIST_LABEL_MAX_LENGTH = 120;

export type UserProfile = {
  authUserId: AuthUserId;
  email: string;
  displayName: string | null;
  initialCapital: number;
  currency: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: string | null;
  preTradeChecklistItems: PreTradeChecklistItem[];
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
  preTradeChecklistItems?: PreTradeChecklistItem[];
};

export function sanitizePreTradeChecklistItems(
  items: PreTradeChecklistItem[],
): PreTradeChecklistItem[] {
  const seen = new Set<string>();

  return items
    .map((item) => ({
      id: item.id.trim(),
      label: item.label.trim().slice(0, PRE_TRADE_CHECKLIST_LABEL_MAX_LENGTH),
    }))
    .filter((item) => {
      if (!item.id || !item.label || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

export function sanitizeUserProfileUpdate(update: UserProfileUpdate): UserProfileUpdate {
  const sanitized: UserProfileUpdate = {
    displayName: update.displayName,
    initialCapital: update.initialCapital,
    currency: update.currency,
    subscriptionTier: update.subscriptionTier,
    subscriptionExpiresAt: update.subscriptionExpiresAt,
    preTradeChecklistItems: update.preTradeChecklistItems === undefined
      ? undefined
      : sanitizePreTradeChecklistItems(update.preTradeChecklistItems),
  };

  return Object.fromEntries(
    Object.entries(sanitized).filter(([, value]) => value !== undefined),
  ) as UserProfileUpdate;
}

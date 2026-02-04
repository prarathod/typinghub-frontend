export type SubscriptionItem = {
  productId: string;
  validUntil: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isPaid?: boolean;
  /** Full list with expiry; use activeProductIds for access checks. */
  subscriptions?: SubscriptionItem[];
  /** Product IDs that are currently valid (not expired). */
  activeProductIds?: string[];
};

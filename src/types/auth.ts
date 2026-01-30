export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isPaid?: boolean;
  subscriptions?: string[];
};

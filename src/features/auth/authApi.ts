import { api } from "@/lib/api";
import type { SubscriptionItem, User } from "@/types/auth";

export type MeResponse = {
  user: Omit<User, "subscriptions" | "activeProductIds">;
  subscriptions: SubscriptionItem[];
  activeProductIds: string[];
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<MeResponse>("/auth/me");
  const { user, subscriptions, activeProductIds } = response.data;
  return { ...user, subscriptions, activeProductIds };
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

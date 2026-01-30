import { api } from "@/lib/api";
import type { User } from "@/types/auth";

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ user: User; subscriptions: string[] }>("/auth/me");
  const { user, subscriptions } = response.data;
  return { ...user, subscriptions };
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

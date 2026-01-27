import { api } from "@/lib/api";
import type { User } from "@/types/auth";

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ user: User }>("/auth/me");
  return response.data.user;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

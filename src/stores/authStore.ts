import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/auth";

type AuthState = {
  token: string | null;
  user: User | null;
  sessionInvalidated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setSessionInvalidated: (value: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      sessionInvalidated: false,
      setToken: (token) => set((state) => ({ token, sessionInvalidated: token ? false : state.sessionInvalidated })),
      setUser: (user) => set({ user }),
      setSessionInvalidated: (value) => set({ sessionInvalidated: value }),
      clearAuth: () => set({ token: null, user: null })
    }),
    { name: "typinghub-auth", partialize: (state) => ({ token: state.token, user: state.user }) }
  )
);

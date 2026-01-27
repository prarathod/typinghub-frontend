import { create } from "zustand";
import { persist } from "zustand/middleware";

type AdminState = {
  token: string | null;
  username: string | null;
  setToken: (token: string | null) => void;
  setUsername: (username: string | null) => void;
  clearAuth: () => void;
};

export const useAdminAuthStore = create<AdminState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      setToken: (token) => set({ token }),
      setUsername: (username) => set({ username }),
      clearAuth: () => set({ token: null, username: null })
    }),
    { name: "typinghub-admin-auth" }
  )
);

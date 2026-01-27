import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "@/features/auth/authApi";
import { useAuthStore } from "@/stores/authStore";

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled: Boolean(token)
  });

  useEffect(() => {
    if (token) {
      setToken(token);
    } else {
      navigate("/");
    }
  }, [navigate, setToken, token]);

  useEffect(() => {
    if (user) {
      setUser(user);
      navigate("/");
    }
  }, [navigate, setUser, user]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
        {isLoading ? "Finalizing your login..." : "Redirecting..."}
      </div>
    </div>
  );
};

import { Navigate } from "react-router-dom";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

type AdminProtectedRouteProps = {
  children: React.ReactNode;
};

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const token = useAdminAuthStore((s) => s.token);
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

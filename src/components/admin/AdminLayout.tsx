import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutAdmin } from "@/features/admin/adminApi";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, clearAuth } = useAdminAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      /* ignore */
    }
    clearAuth();
    navigate("/admin", { replace: true });
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <aside
        className="bg-dark text-white d-flex flex-column"
        style={{ width: "250px", minHeight: "100vh" }}
      >
        <div className="p-3 border-bottom border-secondary">
          <h3 className="h5 fw-bold mb-0">Admin Panel</h3>
          <small className="text-muted">{username}</small>
        </div>
        <nav className="p-2 flex-grow-1">
          {[
            { path: "/admin/dashboard", label: "Dashboard" },
            { path: "/admin/users", label: "Users" },
            { path: "/admin/paragraphs", label: "Paragraphs" },
            { path: "/admin/submissions", label: "Submissions" }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`d-block text-white text-decoration-none p-2 rounded mb-1 ${
                isActive(item.path) ? "bg-primary" : ""
              }`}
              style={{
                transition: "background-color 0.2s",
                backgroundColor: isActive(item.path)
                  ? "rgba(13, 110, 253, 0.3)"
                  : "transparent"
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-top border-secondary mt-auto">
          <button
            type="button"
            className="btn btn-outline-light btn-sm w-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-grow-1" style={{ backgroundColor: "#f8f9fa" }}>
        {children}
      </main>
    </div>
  );
}

import { Offcanvas } from "bootstrap";
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

  const closeSidebarOffcanvas = () => {
    const el = document.getElementById("adminSidebar");
    if (!el) return;
    Offcanvas.getInstance(el)?.hide();
  };

  const handleLogout = async () => {
    closeSidebarOffcanvas();
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
      <div
        className="offcanvas-md offcanvas-start bg-dark text-white d-flex flex-column"
        tabIndex={-1}
        id="adminSidebar"
        aria-labelledby="adminSidebarLabel"
        style={{
          ["--bs-offcanvas-width" as string]: "250px",
          width: "250px",
          flexShrink: 0,
          minHeight: "100vh"
        }}
      >
        <div className="offcanvas-header p-3 border-bottom border-secondary">
          <div>
            <h3 className="h5 fw-bold mb-0" id="adminSidebarLabel">Admin Panel</h3>
            <small className="text-muted">{username}</small>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white d-md-none"
            data-bs-dismiss="offcanvas"
            data-bs-target="#adminSidebar"
            aria-label="Close"
          />
        </div>
        <nav className="offcanvas-body p-2 flex-grow-1 d-block">
          {[
            { path: "/admin/dashboard", label: "Dashboard" },
            { path: "/admin/users", label: "Users" },
            { path: "/admin/paragraphs", label: "Paragraphs" },
            { path: "/admin/submissions", label: "Submissions" },
            { path: "/admin/payments", label: "Payments" }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebarOffcanvas}
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
      </div>
      <main className="flex-grow-1" style={{ backgroundColor: "#f8f9fa", minWidth: 0 }}>
        <div className="d-md-none d-flex align-items-center gap-2 p-2 bg-dark text-white">
          <button
            type="button"
            className="btn btn-outline-light btn-sm"
            data-bs-toggle="offcanvas"
            data-bs-target="#adminSidebar"
            aria-controls="adminSidebar"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="fw-semibold">Admin Panel</span>
        </div>
        {children}
      </main>
    </div>
  );
}

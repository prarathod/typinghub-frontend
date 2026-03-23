import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import longLogo from "@/assets/longLogo.png";
import { LoginDialog } from "@/components/LoginDialog";
import { logout } from "@/features/auth/authApi";
import { useAuthStore } from "@/stores/authStore";
import { getApiBaseUrl } from "@/lib/api";

const PRODUCT_NAMES: Record<string, string> = {
  "english-court": "English Court",
  "english-mpsc": "English MPSC",
  "marathi-court": "Marathi Court",
  "marathi-mpsc": "Marathi MPSC",
};

function SubscriptionTooltip({ activeProductIds, subscriptions }: {
  activeProductIds: string[];
  subscriptions: { productId: string; validUntil: string | null }[];
}) {
  const isPaid = activeProductIds.length > 0;
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
        padding: "12px 16px",
        minWidth: 220,
        zIndex: 2000,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: isPaid ? "#0d9488" : "#64748b" }}>
        {isPaid ? "✓ Active Subscription" : "Free Plan"}
      </div>
      {isPaid ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {activeProductIds.map((pid) => {
            const sub = subscriptions.find((s) => s.productId === pid);
            const expiry = sub?.validUntil
              ? new Date(sub.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "No expiry";
            return (
              <div key={pid} style={{ fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                  {PRODUCT_NAMES[pid] ?? pid}
                </span>
                <span style={{ color: "#94a3b8", marginLeft: 6 }}>
                  · Expires {expiry}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#94a3b8" }}>No active courses</div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <img
      src={longLogo}
      alt="Typing Practice Hub"
      style={{ height: 36, width: "auto" }}
    />
  );
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faqs", label: "FAQs" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [subscriptionTooltipOpen, setSubscriptionTooltipOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const closeMenu = () => setIsOpen(false);
  const isLoggedIn = Boolean(user);

  const handleGetStarted = () => {
    closeMenu();
    // Go directly to Google OAuth (no popup)
    window.location.href = `${getApiBaseUrl()}/auth/google`;
  };

  useEffect(() => {
    if (!avatarDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarDropdownOpen]);

  const handleLogout = async () => {
    setAvatarDropdownOpen(false);
    closeMenu();
    try {
      await logout();
    } finally {
      clearAuth();
      navigate("/");
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm typinghub-navbar"
      style={{ backgroundColor: "var(--navbar-bg, #1e3a5f)" }}
    >
      <LoginDialog open={authOpen} onOpenChange={setAuthOpen} />
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <Logo />
        </Link>
        <button
          className="navbar-toggler border-0 d-lg-none"
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div
          className={`navbar-collapse ${isOpen ? "d-flex" : "d-none"} d-lg-flex`}
        >
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
            {navLinks.map(({ to, label }) => (
              <li className="nav-item" key={to}>
                <NavLink
                  className={({ isActive }) =>
                    `nav-link typinghub-nav-link ${isActive ? "active" : ""}`
                  }
                  to={to}
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex flex-column flex-lg-row align-items-center gap-2">
            {isLoggedIn ? (
              <div
                className="position-relative d-flex align-items-center gap-2"
                ref={avatarRef}
              >
                {/* Paid/Free badge with hover tooltip */}
                <div
                  className="position-relative"
                  onMouseEnter={() => setSubscriptionTooltipOpen(true)}
                  onMouseLeave={() => setSubscriptionTooltipOpen(false)}
                  style={{ cursor: "default" }}
                >
                  {(user?.activeProductIds?.length ?? 0) > 0 ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                      background: "#0d9488", color: "#fff",
                      borderRadius: 6, padding: "2px 7px"
                    }}>PRO</span>
                  ) : (
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)",
                      borderRadius: 6, padding: "2px 7px"
                    }}>FREE</span>
                  )}
                  {subscriptionTooltipOpen && (
                    <SubscriptionTooltip
                      activeProductIds={user?.activeProductIds ?? []}
                      subscriptions={user?.subscriptions ?? []}
                    />
                  )}
                </div>

                <button
                  type="button"
                  className="border-0 bg-transparent p-0 d-flex align-items-center rounded-circle"
                  onClick={() => setAvatarDropdownOpen((o) => !o)}
                  aria-expanded={avatarDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="rounded-circle"
                      width="36"
                      height="36"
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-white bg-opacity-25 text-white d-flex align-items-center justify-content-center fw-semibold typinghub-nav-link"
                      style={{ width: 36, height: 36 }}
                    >
                      {user?.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </button>
                {avatarDropdownOpen && (
                  <div
                    className="dropdown-menu position-absolute end-0 mt-2 d-block py-2 rounded-3 shadow-sm"
                    style={{ minWidth: "10rem", zIndex: 1050 }}
                    role="menu"
                  >
                    <Link
                      className="dropdown-item text-dark text-decoration-none"
                      to="/profile"
                      onClick={() => {
                        setAvatarDropdownOpen(false);
                        closeMenu();
                      }}
                      role="menuitem"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      className="dropdown-item border-0 bg-transparent text-start w-100 text-danger"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-light rounded-pill px-4 typinghub-nav-cta"
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

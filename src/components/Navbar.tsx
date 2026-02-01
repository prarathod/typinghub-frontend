import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import shortLogo from "@/assets/shortLogo.jpg";
import longLogo from "@/assets/longLogo.png";
import { LoginDialog } from "@/components/LoginDialog";
import { logout } from "@/features/auth/authApi";
import { useAuthStore } from "@/stores/authStore";
import { getApiBaseUrl } from "@/lib/api";

function Logo() {
  return (
    <>
      <img
        src={shortLogo}
        alt="Typing Practice Hub"
        className="d-lg-none"
        style={{ height: 36, width: "auto" }}
      />
      <img
        src={longLogo}
        alt="Typing Practice Hub"
        className="d-none d-lg-block"
        style={{ height: 36, width: "auto" }}
      />
    </>
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
                className="position-relative"
                ref={avatarRef}
              >
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

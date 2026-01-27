import { Link } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <main className="container py-5">
        <div className="alert alert-info">Please sign in to view your profile.</div>
        <Link to="/" className="btn btn-primary mt-3">
          Go home
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-5">
      <div className="mb-4">
        <Link to="/" className="text-primary text-decoration-none small">
          ← Back to home
        </Link>
      </div>
      <div className="card border shadow-sm" style={{ maxWidth: "32rem" }}>
        <div className="card-body text-center py-5">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="rounded-circle mb-3"
              width="80"
              height="80"
            />
          ) : (
            <div
              className="rounded-circle bg-secondary bg-opacity-25 d-inline-flex align-items-center justify-content-center mb-3 text-secondary fw-bold"
              style={{ width: 80, height: 80 }}
            >
              {user.name.charAt(0)}
            </div>
          )}
          <h1 className="h4 fw-bold mb-2">{user.name}</h1>
          <p className="text-muted small mb-0">{user.email}</p>
        </div>
      </div>
    </main>
  );
}

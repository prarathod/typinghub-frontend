import { Link } from "react-router-dom";

import type { SubscriptionItem } from "@/types/auth";
import { useAuthStore } from "@/stores/authStore";

const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
  "english-court": "English Court Typing",
  "english-mpsc": "MPSC Exam Typing",
  "marathi-court": "Marathi Court Exam",
  "marathi-mpsc": "Marathi MPSC Typing Exam",
};

function getDaysLeft(validUntil: string | null): number | null {
  if (!validUntil) return null;
  const end = new Date(validUntil);
  const now = new Date();
  const ms = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function formatSubscriptionStatus(item: SubscriptionItem): string {
  const name = PRODUCT_DISPLAY_NAMES[item.productId] ?? item.productId;
  const days = getDaysLeft(item.validUntil);
  if (days === null) return `${name} – premium`;
  if (days === 0) return `${name} – premium – Expired`;
  return `${name} – premium – ${days} day${days === 1 ? "" : "s"} left`;
}

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

  const subscriptions = (user.subscriptions ?? []) as SubscriptionItem[];

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
      {subscriptions.length > 0 && (
        <div className="card border shadow-sm mt-3" style={{ maxWidth: "32rem" }}>
          <div className="card-header bg-light">
            <h2 className="h6 mb-0 fw-semibold">My subscriptions</h2>
          </div>
          <ul className="list-group list-group-flush">
            {subscriptions.map((item) => {
              const days = getDaysLeft(item.validUntil);
              const isExpired = days !== null && days === 0;
              return (
                <li
                  key={item.productId}
                  className={`list-group-item d-flex justify-content-between align-items-center ${isExpired ? "text-muted" : ""}`}
                >
                  <span>{formatSubscriptionStatus(item)}</span>
                  {isExpired && <span className="badge bg-secondary">Expired</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </main>
  );
}

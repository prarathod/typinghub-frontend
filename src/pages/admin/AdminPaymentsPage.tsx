import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPaymentLogs, type PaymentEventType, type PaymentLog } from "@/features/admin/adminApi";

const EVENT_LABELS: Record<PaymentEventType, string> = {
  order_created: "Order Created",
  verify_started: "Verify Started",
  verify_signature_failed: "Signature Failed",
  access_granted: "Access Granted",
  verify_error: "Verify Error"
};

const EVENT_COLORS: Record<PaymentEventType, string> = {
  order_created: "#0d6efd",
  verify_started: "#ffc107",
  verify_signature_failed: "#dc3545",
  access_granted: "#198754",
  verify_error: "#dc3545"
};

const ALL_EVENTS: PaymentEventType[] = [
  "order_created",
  "verify_started",
  "verify_signature_failed",
  "access_granted",
  "verify_error"
];

export function AdminPaymentsPage() {
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("");
  const [orderId, setOrderId] = useState("");
  const [page, setPage] = useState(1);
  const [expandedMeta, setExpandedMeta] = useState<string | null>(null);

  // Applied filters (only update on search)
  const [applied, setApplied] = useState({ email: "", eventType: "", orderId: "" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-payment-logs", applied, page],
    queryFn: () =>
      fetchPaymentLogs({
        email: applied.email || undefined,
        eventType: applied.eventType || undefined,
        orderId: applied.orderId || undefined,
        page
      }),
    placeholderData: (prev) => prev
  });

  const handleSearch = () => {
    setApplied({ email, eventType, orderId });
    setPage(1);
  };

  const handleOrderClick = (id: string) => {
    setOrderId(id);
    setApplied({ email, eventType, orderId: id });
    setPage(1);
  };

  const handleClearFilters = () => {
    setEmail("");
    setEventType("");
    setOrderId("");
    setApplied({ email: "", eventType: "", orderId: "" });
    setPage(1);
  };

  return (
    <div className="p-4">
      <h1 className="h4 fw-bold mb-1">Payment Logs</h1>
      <p className="text-muted small mb-4">
        Track every step of a user's payment journey. Use this to diagnose users who paid but didn't get access.
      </p>

      {/* Diagnosis guide */}
      <div className="alert alert-info small mb-4 py-2">
        <strong>How to diagnose "paid but no access":</strong>
        <ul className="mb-0 mt-1 ps-3">
          <li><span style={{ color: EVENT_COLORS.order_created }}>●</span> <strong>order_created</strong> only → user opened payment modal but never completed it</li>
          <li><span style={{ color: EVENT_COLORS.verify_started }}>●</span> <strong>verify_started</strong> but no <span style={{ color: EVENT_COLORS.access_granted }}>access_granted</span> → verify step failed (check verify_error)</li>
          <li><span style={{ color: EVENT_COLORS.verify_signature_failed }}>●</span> <strong>signature_failed</strong> → possible tampered request or duplicate submission</li>
          <li><span style={{ color: EVENT_COLORS.access_granted }}>●</span> <strong>access_granted</strong> present → payment fully processed; check subscription expiry in Users page</li>
        </ul>
      </div>

      {/* Filters */}
      <div className="card border shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-semibold mb-1">User Email</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="search@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold mb-1">Event Type</label>
              <select
                className="form-select form-select-sm"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="">All events</option>
                {ALL_EVENTS.map((e) => (
                  <option key={e} value={e}>{EVENT_LABELS[e]}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold mb-1">Order ID</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="order_..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="col-md-auto d-flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleSearch}>
                Search
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleClearFilters}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border shadow-sm">
        <div className="card-body p-0">
          {isLoading && (
            <div className="text-center py-5 text-muted">Loading...</div>
          )}
          {isError && (
            <div className="text-center py-5 text-danger">Failed to load payment logs.</div>
          )}
          {!isLoading && !isError && (
            <>
              <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                <span className="small text-muted">
                  {data?.total ?? 0} log{data?.total !== 1 ? "s" : ""} found
                </span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small">Time</th>
                      <th className="small">Event</th>
                      <th className="small">User Email</th>
                      <th className="small">Order ID</th>
                      <th className="small">Payment ID</th>
                      <th className="small">Courses</th>
                      <th className="small">Amount</th>
                      <th className="small">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-4">
                          No logs found
                        </td>
                      </tr>
                    )}
                    {data?.items.map((log: PaymentLog) => (
                      <tr key={log._id}>
                        <td className="small text-nowrap" style={{ fontSize: "11px" }}>
                          {new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: EVENT_COLORS[log.eventType] + "22",
                              color: EVENT_COLORS[log.eventType],
                              border: `1px solid ${EVENT_COLORS[log.eventType]}55`,
                              fontWeight: 600,
                              fontSize: "11px"
                            }}
                          >
                            {EVENT_LABELS[log.eventType]}
                          </span>
                        </td>
                        <td className="small">{log.userEmail ?? "—"}</td>
                        <td className="small">
                          {log.razorpayOrderId !== "unknown" ? (
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-decoration-none"
                              style={{ fontSize: "11px", fontFamily: "monospace" }}
                              onClick={() => handleOrderClick(log.razorpayOrderId)}
                              title="Filter by this order ID"
                            >
                              {log.razorpayOrderId.slice(0, 22)}…
                            </button>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="small" style={{ fontSize: "11px", fontFamily: "monospace" }}>
                          {log.razorpayPaymentId ? log.razorpayPaymentId.slice(0, 18) + "…" : "—"}
                        </td>
                        <td className="small">
                          {log.productIds.length > 0
                            ? log.productIds.map((p) => (
                                <span key={p} className="badge bg-secondary me-1" style={{ fontSize: "10px" }}>
                                  {p.replace("english-", "en-").replace("marathi-", "mr-")}
                                </span>
                              ))
                            : <span className="text-muted">—</span>}
                        </td>
                        <td className="small">
                          {log.amountPaise > 0 ? `₹${log.amountPaise / 100}` : "—"}
                        </td>
                        <td className="small">
                          {log.meta && Object.keys(log.meta).length > 0 ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm py-0 px-1"
                                style={{ fontSize: "11px" }}
                                onClick={() =>
                                  setExpandedMeta(expandedMeta === log._id ? null : log._id)
                                }
                              >
                                {expandedMeta === log._id ? "Hide" : "Show"}
                              </button>
                              {expandedMeta === log._id && (
                                <pre
                                  className="mt-1 p-2 rounded bg-light border"
                                  style={{ fontSize: "10px", maxWidth: "300px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}
                                >
                                  {JSON.stringify(log.meta, null, 2)}
                                </pre>
                              )}
                            </>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(data?.pages ?? 0) > 1 && (
                <div className="d-flex justify-content-center gap-2 py-3">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="small align-self-center text-muted">
                    Page {page} of {data?.pages}
                  </span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={page === (data?.pages ?? 1)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

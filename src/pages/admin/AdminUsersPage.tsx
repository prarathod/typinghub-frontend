import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  deleteUser,
  fetchUserSubscriptions,
  fetchUsers,
  updateUser,
  updateUserSubscriptions,
  type AdminUser
} from "@/features/admin/adminApi";

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isPaidFilter, setIsPaidFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, isPaidFilter],
    queryFn: () =>
      fetchUsers({
        page,
        limit,
        search: search || undefined,
        isPaid: isPaidFilter !== "all" ? isPaidFilter : undefined
      })
  });

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // Days to ADD to each course's expiry (0 = leave an existing subscription's
  // expiry untouched; a brand-new grant with 0 falls back to the standard
  // validity window server-side). Keyed by productId so each course is
  // independent of the others.
  const [productDays, setProductDays] = useState<Record<string, number>>({});
  // Snapshot of isPaid when the dialog opened, so "auto-grant all courses"
  // only fires on an actual free→paid transition in this edit — not whenever
  // an already-paid user's courses happen to read as empty (e.g. an admin
  // deliberately unchecking every course to revoke access).
  const [originalIsPaid, setOriginalIsPaid] = useState(false);

  const handleEdit = (user: AdminUser) => {
    setEditingUser({ ...user });
    setSelectedProductIds([]);
    setProductDays({});
    setOriginalIsPaid(user.isPaid);
  };

  const { data: subscriptionsData } = useQuery({
    queryKey: ["admin-user-subscriptions", editingUser?._id],
    queryFn: () => fetchUserSubscriptions(editingUser!._id),
    enabled: !!editingUser?._id
  });

  useEffect(() => {
    if (subscriptionsData?.productIds) {
      setSelectedProductIds([...subscriptionsData.productIds]);
      setProductDays((prev) => {
        const next = { ...prev };
        for (const pid of subscriptionsData.productIds) {
          if (next[pid] === undefined) next[pid] = 0;
        }
        return next;
      });
    }
  }, [editingUser?._id, subscriptionsData?.productIds]);

  const handleSave = async () => {
    if (!editingUser) return;
    // Guard against saving before this user's current course access has
    // loaded — selectedProductIds would still be its handleEdit-time [],
    // which could wipe or over-grant their existing courses.
    if (!subscriptionsData) return;
    try {
      await updateUser(editingUser._id, {
        name: editingUser.name,
        email: editingUser.email,
        isPaid: editingUser.isPaid
      });
      // Auto-grant all available courses only on an actual free→paid transition
      // with nothing manually picked yet — never when an already-paid user's
      // selection reads empty (that means the admin deliberately revoked everything).
      const allProductIds = subscriptionsData?.products?.map((p) => p.productId) ?? [];
      const toGrantIds = !originalIsPaid && editingUser.isPaid && selectedProductIds.length === 0
        ? allProductIds
        : selectedProductIds;
      const courses = toGrantIds.map((productId) => ({
        productId,
        days: productDays[productId] ?? 0
      }));
      await updateUserSubscriptions(editingUser._id, courses);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-subscriptions", editingUser._id] });
      setEditingUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleCourseAccessToggle = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      setProductDays((d) => {
        if (d[productId] !== undefined) return d;
        const hasExisting = (subscriptionsData?.productIds ?? []).includes(productId);
        // New grant defaults to a 30-day starter window; an already-owned
        // course defaults to "no change" until the admin enters extra days.
        return { ...d, [productId]: hasExisting ? 0 : 30 };
      });
      return [...prev, productId];
    });
  };

  const handleProductDaysChange = (productId: string, days: number) => {
    setProductDays((prev) => ({ ...prev, [productId]: days }));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold mb-0">Users Management</h1>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={isPaidFilter}
                onChange={(e) => {
                  setIsPaidFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All users</option>
                <option value="true">Paid users</option>
                <option value="false">Free users</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : data ? (
        <>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Paid</th>
                      <th>Submissions</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge ${user.isPaid ? "bg-success" : "bg-secondary"}`}
                          >
                            {user.isPaid ? "Paid" : "Free"}
                          </span>
                        </td>
                        <td>{user.submissionCount ?? 0}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteConfirm(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <AdminPagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      ) : null}

      {editingUser && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setEditingUser(null)}
        >
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingUser(null)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Paid Status</label>
                  <select
                    className="form-select"
                    value={editingUser.isPaid ? "true" : "false"}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        isPaid: e.target.value === "true"
                      })
                    }
                  >
                    <option value="false">Free</option>
                    <option value="true">Paid</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label d-block">Course access</label>
                  <small className="text-muted d-block mb-2">
                    Grant, revoke, or swap courses independently. Uncheck a course to remove it,
                    check a new one to add it, and use "+days" to extend a course's own expiry
                    without affecting the others — 0 leaves an existing expiry unchanged.
                  </small>
                  {subscriptionsData?.products?.length ? (
                    <div className="d-flex flex-column gap-2">
                      {subscriptionsData.products.map((product) => {
                        const initialPaymentBased =
                          (subscriptionsData.productIds ?? []).includes(product.productId) &&
                          !(subscriptionsData.adminGrantedProductIds ?? []).includes(product.productId);
                        const hasAccess = selectedProductIds.includes(product.productId);
                        const subEntry = subscriptionsData?.subscriptions?.find(
                          (s) => s.productId === product.productId
                        );
                        const existingValidUntil = subEntry?.validUntil ? new Date(subEntry.validUntil) : null;
                        const expiryText = existingValidUntil
                          ? `Expires: ${existingValidUntil.toLocaleDateString()}`
                          : subEntry ? "No expiry" : null;
                        const days = productDays[product.productId] ?? 0;
                        const newExpiry = hasAccess && days > 0
                          ? new Date(
                              Math.max(existingValidUntil?.getTime() ?? 0, Date.now()) + days * 86400000
                            )
                          : null;
                        return (
                          <div key={product.productId} className="form-check">
                            <div className="d-flex align-items-center flex-wrap gap-2">
                              <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                id={`course-${product.productId}`}
                                checked={hasAccess}
                                onChange={() => handleCourseAccessToggle(product.productId)}
                              />
                              <label
                                className="form-check-label mb-0"
                                htmlFor={`course-${product.productId}`}
                              >
                                {product.name}
                                {initialPaymentBased && (
                                  <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "10px" }}>paid</span>
                                )}
                                {expiryText && (
                                  <span className="text-muted small ms-2">{expiryText}</span>
                                )}
                              </label>
                              {hasAccess && (
                                <div className="d-flex align-items-center gap-1 ms-auto">
                                  <label
                                    className="small text-muted mb-0"
                                    htmlFor={`days-${product.productId}`}
                                  >
                                    +days:
                                  </label>
                                  <input
                                    type="number"
                                    id={`days-${product.productId}`}
                                    className="form-control form-control-sm"
                                    style={{ width: "70px" }}
                                    min={0}
                                    max={3650}
                                    value={days}
                                    onChange={(e) =>
                                      handleProductDaysChange(
                                        product.productId,
                                        Math.max(0, Math.min(3650, parseInt(e.target.value, 10) || 0))
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                            {newExpiry && (
                              <small className="text-success d-block" style={{ marginLeft: "1.6rem" }}>
                                New expiry: {newExpiry.toLocaleDateString()}
                              </small>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : subscriptionsData ? (
                    <span className="text-muted small">No courses configured.</span>
                  ) : (
                    <span className="text-muted small">Loading…</span>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!subscriptionsData}
                  title={!subscriptionsData ? "Loading current course access…" : undefined}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteConfirm(null)}
                />
              </div>
              <div className="modal-body">
                Are you sure you want to delete this user? This will also delete
                all their submissions.
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

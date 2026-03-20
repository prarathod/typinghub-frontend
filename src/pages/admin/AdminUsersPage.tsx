import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const [subscriptionDays, setSubscriptionDays] = useState(30);

  const handleEdit = (user: AdminUser) => {
    setEditingUser({ ...user });
    setSelectedProductIds([]);
    setSubscriptionDays(30);
  };

  const { data: subscriptionsData } = useQuery({
    queryKey: ["admin-user-subscriptions", editingUser?._id],
    queryFn: () => fetchUserSubscriptions(editingUser!._id),
    enabled: !!editingUser?._id
  });

  useEffect(() => {
    if (subscriptionsData?.productIds) {
      setSelectedProductIds([...subscriptionsData.productIds]);
    }
  }, [editingUser?._id, subscriptionsData?.productIds]);

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser._id, {
        name: editingUser.name,
        email: editingUser.email,
        isPaid: editingUser.isPaid
      });
      // If marking as paid and no courses selected, auto-grant all available courses
      const allProductIds = subscriptionsData?.products?.map((p) => p.productId) ?? [];
      const toGrant = editingUser.isPaid && selectedProductIds.length === 0
        ? allProductIds
        : selectedProductIds;
      await updateUserSubscriptions(editingUser._id, toGrant, subscriptionDays);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleCourseAccessToggle = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
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

          {data.totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <li
                      key={n}
                      className={`page-item ${n === page ? "active" : ""}`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    </li>
                  )
                )}
                <li
                  className={`page-item ${
                    page >= data.totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() =>
                      setPage((p) => Math.min(data.totalPages, p + 1))
                    }
                    disabled={page >= data.totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
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
                    Grant, revoke, or swap courses. Uncheck a paid course to remove it; check a new one to add it.
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
                        const expiryText = subEntry?.validUntil
                          ? `Expires: ${new Date(subEntry.validUntil).toLocaleDateString()}`
                          : subEntry ? "No expiry" : null;
                        return (
                          <div key={product.productId} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`course-${product.productId}`}
                              checked={hasAccess}
                              onChange={() => handleCourseAccessToggle(product.productId)}
                            />
                            <label
                              className="form-check-label"
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
                          </div>
                        );
                      })}
                    </div>
                  ) : subscriptionsData ? (
                    <span className="text-muted small">No courses configured.</span>
                  ) : (
                    <span className="text-muted small">Loading…</span>
                  )}
                  {(editingUser.isPaid || selectedProductIds.length > 0) && (
                    <div className="mt-3">
                      <label className="form-label mb-1">Duration (days)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm w-auto"
                        min={1}
                        max={3650}
                        value={subscriptionDays}
                        onChange={(e) =>
                          setSubscriptionDays(Math.max(1, Math.min(3650, parseInt(e.target.value, 10) || 1)))
                        }
                      />
                      <small className="text-muted d-block mt-1">
                        Expires on:{" "}
                        {new Date(Date.now() + subscriptionDays * 86400000).toLocaleDateString()}
                      </small>
                    </div>
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

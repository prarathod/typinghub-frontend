import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createParagraph,
  deleteParagraph,
  fetchParagraphs,
  updateParagraph,
  updateParagraphPublished,
  type AdminParagraph
} from "@/features/admin/adminApi";

const EMPTY_PARAGRAPH: Omit<AdminParagraph, "_id" | "solvedCount" | "createdAt"> = {
  title: "",
  isFree: true,
  accessType: "free",
  language: "english",
  category: "lessons",
  order: 0,
  text: "",
  published: false
};

export function AdminParagraphsPage() {
  const [page, setPage] = useState(1);
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingParagraph, setEditingParagraph] =
    useState<AdminParagraph | null>(null);
  const [creatingParagraph, setCreatingParagraph] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-paragraphs", page, languageFilter, categoryFilter],
    queryFn: () =>
      fetchParagraphs({
        page,
        limit,
        language: languageFilter !== "all" ? languageFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined
      })
  });

  const handleCreate = () => {
    setCreatingParagraph(true);
    setEditingParagraph({
      ...EMPTY_PARAGRAPH,
      _id: "",
      solvedCount: 0,
      createdAt: "",
      order: typeof EMPTY_PARAGRAPH.order === "number" ? EMPTY_PARAGRAPH.order : 0
    } as AdminParagraph);
  };

  const handleTogglePublished = async (para: AdminParagraph) => {
    const next = !(para.published ?? false);
    try {
      await updateParagraphPublished(para._id, next);
      queryClient.invalidateQueries({ queryKey: ["admin-paragraphs"] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update publish status");
    }
  };

  const handleEdit = (para: AdminParagraph) => {
    setEditingParagraph({
      ...para,
      published: para.published ?? false,
      order: typeof para.order === "number" ? para.order : 0,
      accessType: para.accessType ?? (para.isFree ? "free" : "paid")
    });
    setCreatingParagraph(false);
  };

  const handleSave = async () => {
    if (!editingParagraph) return;
    try {
      if (creatingParagraph) {
        const { _id, solvedCount, createdAt, ...data } = editingParagraph;
        await createParagraph(data);
      } else {
        const { _id, solvedCount, createdAt, ...updateData } = editingParagraph;
        await updateParagraph(_id, updateData);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-paragraphs"] });
      setEditingParagraph(null);
      setCreatingParagraph(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save paragraph");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteParagraph(id);
      queryClient.invalidateQueries({ queryKey: ["admin-paragraphs"] });
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete paragraph");
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold mb-0">Paragraphs Management</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreate}
        >
          Create Paragraph
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <select
                className="form-select"
                value={languageFilter}
                onChange={(e) => {
                  setLanguageFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All languages</option>
                <option value="english">English</option>
                <option value="marathi">Marathi</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All categories</option>
                <option value="lessons">Lessons</option>
                <option value="court-exam">Court Exam</option>
                <option value="mpsc">MPSC</option>
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
                      <th>Order</th>
                      <th>Title</th>
                      <th>Language</th>
                      <th>Category</th>
                      <th>Free/Paid</th>
                      <th>Published</th>
                      <th>Solved</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((para) => (
                      <tr key={para._id}>
                        <td>{typeof para.order === "number" ? para.order : 0}</td>
                        <td>{para.title}</td>
                        <td>
                          <span className="badge bg-info">{para.language}</span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {para.category}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              (para.accessType ?? (para.isFree ? "free" : "paid")) === "free"
                                ? "bg-success"
                                : (para.accessType ?? "") === "free-after-login"
                                  ? "bg-info"
                                  : "bg-dark"
                            }`}
                          >
                            {para.accessType === "free-after-login"
                              ? "Free after login"
                              : para.accessType === "paid"
                                ? "Paid"
                                : para.isFree
                                  ? "Free"
                                  : "Paid"}
                          </span>
                        </td>
                        <td>
                          <div className="form-check form-switch mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              role="switch"
                              id={`publish-${para._id}`}
                              checked={para.published ?? false}
                              onChange={() => handleTogglePublished(para)}
                            />
                            <label className="form-check-label small" htmlFor={`publish-${para._id}`}>
                              {(para.published ?? false) ? "Published" : "Unpublished"}
                            </label>
                          </div>
                        </td>
                        <td>{para.solvedCount}</td>
                        <td>{new Date(para.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(para)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteConfirm(para._id)}
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

      {editingParagraph && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => {
            setEditingParagraph(null);
            setCreatingParagraph(false);
          }}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {creatingParagraph ? "Create Paragraph" : "Edit Paragraph"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setEditingParagraph(null);
                    setCreatingParagraph(false);
                  }}
                />
              </div>
              <div className="modal-body overflow-auto" style={{ maxHeight: "70vh" }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingParagraph.title}
                      onChange={(e) =>
                        setEditingParagraph({
                          ...editingParagraph,
                          title: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Order</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={
                        typeof editingParagraph.order === "number" && Number.isFinite(editingParagraph.order)
                          ? editingParagraph.order
                          : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        const num = v === "" ? 0 : parseInt(v, 10);
                        setEditingParagraph({
                          ...editingParagraph,
                          order: v === "" ? 0 : (Number.isFinite(num) ? num : 0)
                        });
                      }}
                      placeholder="0"
                    />
                    <small className="text-muted">Display order (lower = first). Used for Court Exam, MPSC, Lessons.</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Language</label>
                    <select
                      className="form-select"
                      value={editingParagraph.language}
                      onChange={(e) =>
                        setEditingParagraph({
                          ...editingParagraph,
                          language: e.target.value as "english" | "marathi"
                        })
                      }
                    >
                      <option value="english">English</option>
                      <option value="marathi">Marathi</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={editingParagraph.category}
                      onChange={(e) =>
                        setEditingParagraph({
                          ...editingParagraph,
                          category: e.target.value as "lessons" | "court-exam" | "mpsc"
                        })
                      }
                    >
                      <option value="lessons">Lessons</option>
                      <option value="court-exam">Court Exam</option>
                      <option value="mpsc">MPSC</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Access</label>
                    <select
                      className="form-select"
                      value={editingParagraph.accessType ?? (editingParagraph.isFree ? "free" : "paid")}
                      onChange={(e) => {
                        const at = e.target.value as "free" | "free-after-login" | "paid";
                        setEditingParagraph({
                          ...editingParagraph,
                          accessType: at,
                          isFree: at !== "paid"
                        });
                      }}
                    >
                      <option value="free">Free</option>
                      <option value="free-after-login">Free after login</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch py-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        role="switch"
                        id="edit-published"
                        checked={Boolean(editingParagraph.published)}
                        onChange={(e) =>
                          setEditingParagraph({
                            ...editingParagraph,
                            published: e.target.checked
                          })
                        }
                      />
                      <label className="form-check-label fw-medium" htmlFor="edit-published">
                        Published — visible on practice pages
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Text</label>
                    <textarea
                      className="form-control font-monospace"
                      rows={10}
                      value={editingParagraph.text}
                      onChange={(e) =>
                        setEditingParagraph({
                          ...editingParagraph,
                          text: e.target.value
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingParagraph(null);
                    setCreatingParagraph(false);
                  }}
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
                Are you sure you want to delete this paragraph? This will also
                delete all submissions for this paragraph.
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

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSubmissions, type AdminSubmission } from "@/features/admin/adminApi";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AdminSubmissionsPage() {
  const [page, setPage] = useState(1);
  const [paragraphIdFilter, setParagraphIdFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-submissions", page, paragraphIdFilter, userIdFilter, sortBy],
    queryFn: () =>
      fetchSubmissions({
        page,
        limit,
        paragraphId: paragraphIdFilter || undefined,
        userId: userIdFilter || undefined,
        sortBy
      })
  });

  return (
    <div className="p-4">
      <h1 className="h3 fw-bold mb-4">Submissions</h1>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by Paragraph ID..."
                value={paragraphIdFilter}
                onChange={(e) => {
                  setParagraphIdFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by User ID..."
                value={userIdFilter}
                onChange={(e) => {
                  setUserIdFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
                <option value="createdAt">Sort by Date</option>
                <option value="timeTakenSeconds">Sort by Time (fastest)</option>
                <option value="wpm">Sort by WPM (highest)</option>
                <option value="accuracy">Sort by Accuracy (highest)</option>
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
                      <th>User</th>
                      <th>Paragraph</th>
                      <th>Time</th>
                      <th>WPM</th>
                      <th>Accuracy</th>
                      <th>Words</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((s: AdminSubmission) => {
                      const userName =
                        typeof s.userId === "object" && s.userId
                          ? s.userId.name
                          : "Anonymous";
                      const userEmail =
                        typeof s.userId === "object" && s.userId
                          ? s.userId.email
                          : "";
                      const paraTitle =
                        typeof s.paragraphId === "object"
                          ? s.paragraphId.title
                          : "—";
                      return (
                        <tr key={String(s._id)}>
                          <td>
                            <div>{userName}</div>
                            {userEmail && (
                              <small className="text-muted">{userEmail}</small>
                            )}
                          </td>
                          <td>{paraTitle}</td>
                          <td>{formatTime(s.timeTakenSeconds)}</td>
                          <td>{s.wpm}</td>
                          <td>{s.accuracy}%</td>
                          <td>
                            {s.correctWordsCount} / {s.wordsTyped}
                          </td>
                          <td>{new Date(s.createdAt).toLocaleString()}</td>
                        </tr>
                      );
                    })}
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
    </div>
  );
}

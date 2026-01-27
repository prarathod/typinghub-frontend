import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { fetchStats, fetchSubmissions } from "@/features/admin/adminApi";

export function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchStats()
  });

  const { data: recentSubmissions } = useQuery({
    queryKey: ["admin-recent-submissions"],
    queryFn: () => fetchSubmissions({ page: 1, limit: 10, sortBy: "createdAt" })
  });

  const chartData =
    stats?.submissionsByDay.map((d) => ({
      date: d._id,
      submissions: d.count
    })) ?? [];

  return (
    <div className="p-4">
      <h1 className="h3 fw-bold mb-4">Dashboard</h1>

      {statsLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : stats ? (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="small text-muted mb-1">Total Users</div>
                  <div className="h4 fw-bold mb-0">{stats.totalUsers}</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="small text-muted mb-1">Total Paragraphs</div>
                  <div className="h4 fw-bold mb-0">{stats.totalParagraphs}</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="small text-muted mb-1">Total Submissions</div>
                  <div className="h4 fw-bold mb-0">{stats.totalSubmissions}</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="small text-muted mb-1">Recent (7 days)</div>
                  <div className="h4 fw-bold mb-0">{stats.recentSubmissions}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Submissions Over Time (Last 7 Days)</h5>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="submissions"
                          stroke="#0d6efd"
                          name="Submissions"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted small mb-0">No data available</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Top Users</h5>
                  {stats.topUsers.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {stats.topUsers.slice(0, 5).map((u, i) => (
                        <div
                          key={u.userId}
                          className="list-group-item px-0 d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="fw-semibold">{u.userName}</div>
                            <small className="text-muted">
                              {u.avgWpm} WPM · {u.avgAccuracy}% accuracy
                            </small>
                          </div>
                          <span className="badge bg-primary">#{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Recent Submissions</h5>
              {recentSubmissions?.items.length ? (
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Paragraph</th>
                        <th>Time</th>
                        <th>WPM</th>
                        <th>Accuracy</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubmissions.items.map((s) => {
                        const userName =
                          typeof s.userId === "object" && s.userId
                            ? s.userId.name
                            : "Anonymous";
                        const paraTitle =
                          typeof s.paragraphId === "object"
                            ? s.paragraphId.title
                            : "—";
                        return (
                          <tr key={String(s._id)}>
                            <td>{userName}</td>
                            <td>{paraTitle}</td>
                            <td>{Math.floor(s.timeTakenSeconds / 60)}:{(s.timeTakenSeconds % 60).toString().padStart(2, "0")}</td>
                            <td>{s.wpm}</td>
                            <td>{s.accuracy}%</td>
                            <td>
                              {new Date(s.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted small mb-0">No recent submissions</p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

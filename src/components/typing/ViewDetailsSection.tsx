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

import {
  fetchLeaderboard,
  fetchHistory,
  type LeaderboardEntry,
  type HistorySubmission
} from "@/features/paragraphs/paragraphsApi";
import { useAuthStore } from "@/stores/authStore";
import type { TypingMetrics } from "@/lib/typingMetrics";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

type ViewDetailsSectionProps = {
  paragraphId: string;
  currentMetrics: TypingMetrics | null;
};

export function ViewDetailsSection({
  paragraphId,
  currentMetrics
}: ViewDetailsSectionProps) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = Boolean(user);

  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    isError: leaderboardError
  } = useQuery({
    queryKey: ["leaderboard", paragraphId],
    queryFn: () => fetchLeaderboard(paragraphId),
    staleTime: 30_000
  });

  const {
    data: historyData,
    isLoading: historyLoading,
    isError: historyError
  } = useQuery({
    queryKey: ["history", paragraphId],
    queryFn: () => fetchHistory(paragraphId),
    enabled: isLoggedIn,
    staleTime: 30_000
  });

  const chartData =
    historyData?.submissions
      .slice()
      .reverse()
      .map((s, i) => ({
        attempt: i + 1,
        wpm: s.wpm,
        time: s.timeTakenSeconds,
        accuracy: s.accuracy
      })) ?? [];
  const showChart = chartData.length >= 2;

  return (
    <div className="mt-4 pt-4 border-top border-secondary">
      <h3 className="h6 fw-bold mb-3" style={{ color: "#8b1538" }}>
        View Details
      </h3>

      {/* Top 10 */}
      <div className="mb-4">
        <h4 className="h6 fw-semibold mb-2">Top 10 — Fastest completions</h4>
        {leaderboardLoading ? (
          <div className="text-muted small">Loading leaderboard…</div>
        ) : leaderboardError ? (
          <p className="text-danger small mb-0">Could not load leaderboard.</p>
        ) : leaderboardData?.leaderboard.length ? (
          <div className="table-responsive">
            <table className="table table-sm table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Time</th>
                  <th>WPM</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.leaderboard.map((e: LeaderboardEntry) => (
                  <tr
                    key={e.rank}
                    className={e.isYou ? "table-primary" : undefined}
                  >
                    <td>{e.rank}</td>
                    <td>
                      {e.userName}
                      {e.isYou && (
                        <span className="badge bg-primary ms-1">You</span>
                      )}
                    </td>
                    <td>{formatTime(e.timeTakenSeconds)}</td>
                    <td>{e.wpm}</td>
                    <td>{e.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted small mb-0">No entries yet. Be the first!</p>
        )}
      </div>

      {/* Your standing */}
      <div className="mb-4">
        <h4 className="h6 fw-semibold mb-2">Your standing</h4>
        {currentMetrics && (
          <div className="rounded-3 border bg-light p-3 mb-2">
            <div className="small mb-1">
              <strong>This attempt:</strong> {formatTime(currentMetrics.timeTakenSeconds)} ·{" "}
              {currentMetrics.wpm} WPM · {currentMetrics.accuracy}% accuracy
            </div>
            {leaderboardData?.yourRank != null && (
              <div className="small text-primary fw-semibold">
                Your rank: #{leaderboardData.yourRank}
              </div>
            )}
            {leaderboardData?.yourBest && (
              <div className="small text-muted mt-1">
                Your best: {formatTime(leaderboardData.yourBest.timeTakenSeconds)} ·{" "}
                {leaderboardData.yourBest.wpm} WPM
              </div>
            )}
          </div>
        )}
        {!currentMetrics && leaderboardData?.yourBest && (
          <div className="rounded-3 border bg-light p-3 small">
            <strong>Your best:</strong> {formatTime(leaderboardData.yourBest.timeTakenSeconds)} ·{" "}
            {leaderboardData.yourBest.wpm} WPM · #{leaderboardData.yourRank ?? "—"}
          </div>
        )}
        {!leaderboardData?.yourBest && !currentMetrics && (
          <p className="text-muted small mb-0">Submit an attempt to see your standing.</p>
        )}
      </div>

      {/* History — logged-in only */}
      <div className="mb-2">
        <h4 className="h6 fw-semibold mb-2">History</h4>
        {!isLoggedIn ? (
          <p className="text-muted small mb-0">
            Sign in to see your progress over time, stats, and all submissions.
          </p>
        ) : historyError ? (
          <p className="text-danger small mb-0">
            Could not load history. Try signing in again.
          </p>
        ) : historyLoading ? (
          <div className="text-muted small">Loading history…</div>
        ) : historyData && historyData.submissions.length > 0 ? (
          <>
            {/* Stats */}
            <div className="d-flex flex-wrap gap-3 mb-3">
              <div className="rounded-3 border bg-white px-3 py-2 small">
                <span className="text-muted">Attempts</span>
                <div className="fw-bold">{historyData.stats.totalAttempts}</div>
              </div>
              <div className="rounded-3 border bg-white px-3 py-2 small">
                <span className="text-muted">Best time</span>
                <div className="fw-bold">{formatTime(historyData.stats.bestTimeSeconds)}</div>
              </div>
              <div className="rounded-3 border bg-white px-3 py-2 small">
                <span className="text-muted">Best WPM</span>
                <div className="fw-bold">{historyData.stats.bestWpm}</div>
              </div>
              <div className="rounded-3 border bg-white px-3 py-2 small">
                <span className="text-muted">Avg. accuracy</span>
                <div className="fw-bold">{historyData.stats.avgAccuracy}%</div>
              </div>
            </div>

            {/* Progress chart: WPM over attempts */}
            {showChart && (
              <div className="mb-3" style={{ height: "200px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="attempt"
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Attempt",
                        position: "insideBottom",
                        offset: -5
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "WPM",
                        angle: -90,
                        position: "insideLeft"
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="wpm"
                      stroke="#0d6efd"
                      name="WPM"
                      dot={{ r: 4 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* All submissions table */}
            <div className="table-responsive">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>WPM</th>
                    <th>Accuracy</th>
                    <th>Correct</th>
                    <th>Incorrect</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.submissions.map((s: HistorySubmission, i: number) => (
                    <tr key={String(s._id)}>
                      <td>{historyData.submissions.length - i}</td>
                      <td>{formatDate(s.createdAt)}</td>
                      <td>{formatTime(s.timeTakenSeconds)}</td>
                      <td>{s.wpm}</td>
                      <td>{s.accuracy}%</td>
                      <td>{s.correctWordsCount}</td>
                      <td>{s.incorrectWordsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-muted small mb-0">
            No history yet. Retry this passage and submit to track your progress.
          </p>
        )}
      </div>
    </div>
  );
}

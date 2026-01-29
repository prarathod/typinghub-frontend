import { Link } from "react-router-dom";

export function MarathiPracticePage() {
  return (
    <main className="container py-5">
      <div className="mb-4">
        <Link to="/" className="text-success text-decoration-none small">
          ← Back to home
        </Link>
      </div>
      <div className="mb-5">
        <h1 className="display-6 fw-bold text-dark mb-2">Marathi Typing Practice</h1>
        <p className="text-muted mb-0">
          Start a focused session with Marathi typing passages for all typing exams.
          Track your progress in real time.
        </p>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border shadow-sm">
            <div className="card-body p-4">
              <p className="text-muted small mb-0">
                Typing passage will appear here. This area will contain the
                typing text, input field, and live accuracy indicators.
              </p>
              <div className="mt-4 rounded-3 border border-2 border-dashed bg-light p-5 text-center text-muted small">
                Typing canvas placeholder
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-semibold mb-4">Session controls</h2>
              <div className="d-flex flex-column gap-3 small">
                <div className="d-flex justify-content-between align-items-center rounded-3 border bg-light px-3 py-2">
                  <span className="text-muted">Timer</span>
                  <span className="fw-semibold">15:00</span>
                </div>
                <div className="d-flex justify-content-between align-items-center rounded-3 border bg-light px-3 py-2">
                  <span className="text-muted">Target WPM</span>
                  <span className="fw-semibold">40+</span>
                </div>
              </div>
              <div className="mt-4 d-flex flex-column gap-2">
                <button type="button" className="btn btn-success rounded-pill">
                  Start session
                </button>
                <button type="button" className="btn btn-outline-secondary rounded-pill">
                  View previous results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

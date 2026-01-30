import { Link } from "react-router-dom";

function SparkleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 16 16"
      className="flex-shrink-0"
      style={{ color: "#fd7e14" }}
      aria-hidden
    >
      <path d="M8 0l1.5 4.5L14 6l-4.5 1.5L8 12l-1.5-4.5L2 6l4.5-1.5L8 0z" />
    </svg>
  );
}

const CARD_CLASS =
  "rounded-3 p-4 shadow-sm d-block h-100 text-decoration-none";
const CARD_ACTIVE = "bg-success bg-opacity-10 border border-success border-opacity-25";
const CARD_DISABLED = "bg-light border border-secondary border-opacity-25";
const CARD_HOVER = {
  style: { transition: "transform 0.2s, box-shadow 0.2s" as const },
  onMouseOver: (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.1)";
  },
  onMouseOut: (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "";
  },
};

export function PracticePage() {
  return (
    <main className="container py-5">
      <div
        className="mb-4"
        style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "0.75rem", alignItems: "center" }}
      >
        <Link to="/" className="text-primary text-decoration-none small">
          ← Back to home
        </Link>
        <h1 className="display-6 fw-bold text-dark mb-0 text-center">
          English Typing Practice
        </h1>
        <div />
      </div>
      <div className="mb-5 text-center">
        <p className="text-muted mb-0">
          Choose a category to start practicing with English typing passages.
        </p>
      </div>

      {/* Top row: single centered card - Typing Lessons */}
      <div className="row justify-content-center mb-4">
        <div className="col-12 col-md-4 col-lg-4 col-xl-4">
          <Link
            to="/practice/lessons"
            className={`${CARD_CLASS} ${CARD_ACTIVE}`}
            style={CARD_HOVER.style}
            onMouseOver={CARD_HOVER.onMouseOver}
            onMouseOut={CARD_HOVER.onMouseOut}
          >
            <h3 className="h5 fw-bold text-dark mb-2">Typing Lessons</h3>
            <p className="mb-0 small text-secondary d-flex align-items-center gap-1 flex-wrap">
              <SparkleIcon />
              <span>Power Up Your Day with Typing Lessons</span>
            </p>
          </Link>
        </div>
      </div>

      {/* Middle row: Court Exam and MPSC side by side */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <Link
            to="/practice/court-exam"
            className={`${CARD_CLASS} ${CARD_ACTIVE}`}
            style={CARD_HOVER.style}
            onMouseOver={CARD_HOVER.onMouseOver}
            onMouseOut={CARD_HOVER.onMouseOut}
          >
            <h3 className="h5 fw-bold text-dark mb-2">Court Exam Typing Practice</h3>
            <p className="mb-0 small text-secondary">• Typing practice based on Court exam pattern</p>
          </Link>
        </div>
        <div className="col-12 col-md-4">
          <Link
            to="/practice/mpsc"
            className={`${CARD_CLASS} ${CARD_ACTIVE}`}
            style={CARD_HOVER.style}
            onMouseOver={CARD_HOVER.onMouseOver}
            onMouseOut={CARD_HOVER.onMouseOut}
          >
            <h3 className="h5 fw-bold text-dark mb-2">MPSC Exam Typing Practice</h3>
            <p className="mb-0 small text-secondary">• Typing practice based on MPSC exam pattern</p>
          </Link>
        </div>
        <div className="col-12 col-md-4">
          <div
            className={`${CARD_CLASS} ${CARD_DISABLED}`}
            style={{ cursor: "default", ...CARD_HOVER.style }}
            onMouseOver={CARD_HOVER.onMouseOver}
            onMouseOut={CARD_HOVER.onMouseOut}
          >
            <h3 className="h5 fw-bold text-secondary mb-2">Other Exam Typing Practice</h3>
            <p className="mb-0 small text-secondary opacity-75">Coming Soon...</p>
          </div>
        </div>
      </div>

      {/* Last row: disabled card - light gray */}
      <div className="row">
        
      </div>
    </main>
  );
}

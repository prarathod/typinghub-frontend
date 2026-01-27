import { Link } from "react-router-dom";

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}

function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

const practiceCards = [
  {
    title: "Lessons",
    subtitle: "Structured typing lessons",
    to: "/practice/lessons",
    bgClass: "bg-primary bg-opacity-10 border border-primary border-opacity-25",
    iconBg: "bg-primary bg-opacity-15",
    iconColor: "text-primary",
    Icon: BookIcon,
  },
  {
    title: "Court Exam Typing Practice",
    subtitle: "Practice for court typing exams",
    to: "/practice/court-exam",
    bgClass: "bg-info bg-opacity-10 border border-info border-opacity-25",
    iconBg: "bg-info bg-opacity-15",
    iconColor: "text-info",
    Icon: ScaleIcon,
  },
  {
    title: "MPSC Exam Typing",
    subtitle: "Practice for MPSC typing exams",
    to: "/practice/mpsc",
    bgClass: "bg-success bg-opacity-10 border border-success border-opacity-25",
    iconBg: "bg-success bg-opacity-15",
    iconColor: "text-success",
    Icon: DocumentIcon,
  },
];

export function PracticePage() {
  return (
    <main className="container py-5">
      <div className="mb-4">
        <Link to="/" className="text-primary text-decoration-none small">
          ← Back to home
        </Link>
      </div>
      <div className="mb-5">
        <h1 className="display-6 fw-bold text-dark mb-2">English Typing Practice</h1>
        <p className="text-muted mb-0">
          Choose a category to start practicing with English typing passages.
        </p>
      </div>

      <div className="row g-4 mb-4">
        {practiceCards.map((card) => {
          const Icon = card.Icon;
          return (
            <div key={card.title} className="col-12 col-sm-6 col-lg-4">
              <Link
                to={card.to}
                className={`text-decoration-none d-flex align-items-center gap-3 rounded-3 p-4 h-100 shadow-sm ${card.bgClass}`}
                style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 0.5rem 1rem rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${card.iconBg}`}
                  style={{ width: "56px", height: "56px" }}
                >
                  <Icon className={card.iconColor} />
                </div>
                <div>
                  <h3 className="h5 fw-bold text-dark mb-1">{card.title}</h3>
                  <p className="mb-0 small text-secondary">{card.subtitle}</p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-3 p-4 text-center border border-secondary border-opacity-25 bg-secondary bg-opacity-10"
        role="status"
        aria-live="polite"
      >
        <p className="mb-0 text-secondary small fw-medium">
          More exams are coming soon.
        </p>
      </div>
    </main>
  );
}

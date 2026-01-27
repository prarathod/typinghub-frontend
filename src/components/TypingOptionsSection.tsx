import { Link } from "react-router-dom";

function GiftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="currentColor"
      viewBox="0 0 16 16"
      className="text-success flex-shrink-0"
      aria-hidden
    >
      <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07.002.14.004.212H14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.004a2.5 2.5 0 0 1 .496-1.5zM5 1a1.5 1.5 0 0 0-1.5 1.5v1h3V2.5A1.5 1.5 0 0 0 5 1zm4 0a1.5 1.5 0 0 0-1.5 1.5v1h3V2.5A1.5 1.5 0 0 0 9 1zM4.5 5v2h7V5H4.5zM3 13.5V6h2v7.5a.5.5 0 0 1-2 0zm9 0V6h2v7.5a.5.5 0 0 1-2 0z" />
    </svg>
  );
}

function KeyboardIcon({ className }: { className?: string }) {
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
      <rect x="2" y="6" width="20" height="12" rx="1.5" />
      <path d="M6 10h1.5M9.5 10h1.5M13 10h1.5M16.5 10H18M5 14h4M11 14h2M17 14h2" />
    </svg>
  );
}

const cards = [
  {
    title: "English Typing",
    subtitle: "For all typing exams",
    to: "/practice",
    bgClass: "bg-primary bg-opacity-10 border border-primary border-opacity-25",
    iconBg: "bg-primary bg-opacity-15",
    iconColor: "text-primary",
  },
  {
    title: "Marathi Typing",
    subtitle: "For all typing exams",
    to: "/practice/marathi",
    bgClass: "bg-success bg-opacity-10 border border-success border-opacity-25",
    iconBg: "bg-success bg-opacity-15",
    iconColor: "text-success",
  },
];

export function TypingOptionsSection() {
  return (
    <section className="py-5" style={{ background: "linear-gradient(180deg, #f8f9fa 0%, #fff 100%)" }}>
      <div className="container py-4">
        {/* Top banner */}
        <div
          className="d-flex align-items-center justify-content-center gap-3 rounded-3 shadow-sm py-3 px-4 mb-4 mx-auto"
          style={{
            maxWidth: "480px",
            backgroundColor: "var(--bs-gray-200)",
          }}
        >
          <GiftIcon />
          <p className="mb-0 text-body-emphasis small">
            <span className="text-dark">Practice 5 Typing Passages </span>
            <span className="fw-bold text-success">FREE</span>
            <span className="text-dark"> – No Sign-Up Required</span>
          </p>
        </div>

        {/* Typing option cards */}
        <div className="row justify-content-center g-4">
          {cards.map((card) => (
            <div key={card.title} className="col-12 col-sm-6 col-lg-5">
              <Link
                to={card.to}
                className={`text-decoration-none d-flex align-items-center gap-3 rounded-3 p-4 h-100 shadow-sm ${card.bgClass}`}
                style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.1)";
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
                  <KeyboardIcon className={card.iconColor} />
                </div>
                <div>
                  <h3 className="h5 fw-bold text-dark mb-1">{card.title}</h3>
                  <p className="mb-0 small text-secondary">{card.subtitle}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

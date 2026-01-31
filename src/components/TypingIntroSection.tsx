import { Link } from "react-router-dom";

import englishLogo from "@/assets/englishLogo.jpeg";
import marathiLogo from "@/assets/marathiLogo.jpeg";

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

function RocketIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary flex-shrink-0"
      aria-hidden
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15 9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

const cards = [
  {
    title: "English Typing",
    subtitle: "For all typing exams",
    to: "/practice",
    bgClass: "bg-primary bg-opacity-10 border border-primary border-opacity-25",
    logoSrc: englishLogo,
  },
  {
    title: "Marathi Typing",
    subtitle: "For all typing exams",
    to: "/practice/marathi",
    bgClass: "bg-success bg-opacity-10 border border-success border-opacity-25",
    logoSrc: marathiLogo,
  },
];

export function TypingIntroSection() {
  return (
    <section
      className="py-5"
      style={{
        background: "linear-gradient(90deg, #e8f4fc 0%, #f0f9f0 50%, #f8faf8 100%)",
      }}
    >
      <div className="container py-4">
        {/* Main heading — Tinos Bold 700 */}
        <h1
          className="typing-intro-title text-center fw-bold mb-3 mx-auto"
          style={{
            maxWidth: "720px",
            fontSize: "clamp(1.65rem, 4.5vw, 2.5rem)",
            color: "#000"
          }}
        >
          Typing Practice for All Competitive & Professional Exams
        </h1>
        {/* Subtitle — Tinos Bold 700 Italic */}
        <p
          className="typing-intro-subtitle text-center mb-4 mx-auto"
          style={{
            maxWidth: "560px",
            fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
            color: "#000"
          }}
        >
          Improve typing speed & accuracy with real exam-level passages
        </p>
        {/* CTA banner */}
        <div
          className="d-flex align-items-center justify-content-center gap-3 rounded-3 shadow-sm py-3 px-4 mb-4 mx-auto"
          style={{
            maxWidth: "520px",
            backgroundColor: "#cce5ff",
          }}
        >
          <GiftIcon />
          <p className="mb-0 fw-semibold" style={{ color: "#1e3a5f", fontSize: "1rem" }}>
            Practice 5 Typing Passages <span className="text-success">FREE</span> – No Sign-Up Required
          </p>
        </div>
        <div
          className="signup-unlock-cta d-flex align-items-center justify-content-center gap-3 rounded-3 shadow-sm py-3 px-4 mb-4 mx-auto"
          style={{ maxWidth: "520px" }}
        >
          <RocketIcon />
          <p className="mb-0 fw-semibold" style={{ color: "#1e3a5f", fontSize: "1rem" }}>
            Sign up and unlock <span className="text-success">5 Additional Passages</span>  to level up your speed even faster
          </p>
        </div>
        {/* Language cards */}
        <div className="row justify-content-center g-4">
          {cards.map((card) => (
            <div key={card.title} className="col-12 col-sm-6 col-lg-5">
              <Link
                to={card.to}
                className={`text-decoration-none d-flex flex-column align-items-center justify-content-center gap-3 rounded-3 p-4 h-100 shadow-sm text-center ${card.bgClass}`}
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
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                  style={{ width: "56px", height: "56px" }}
                >
                  <img
                    src={card.logoSrc}
                    alt=""
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div>
                  <h3 className="fw-bold text-dark mb-1" style={{ fontSize: "1.35rem" }}>{card.title}</h3>
                  <p className="mb-0 text-secondary" style={{ fontSize: "1rem" }}>{card.subtitle}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

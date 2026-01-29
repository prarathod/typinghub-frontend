import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { LoginDialog } from "@/components/LoginDialog";
import { PricingDialog } from "@/components/PricingDialog";
import {
  fetchParagraphs,
  type ParagraphListItem,
  type PriceFilter,
} from "@/features/paragraphs/paragraphsApi";
import { useAuthStore } from "@/stores/authStore";

type ParagraphCardProps = {
  p: ParagraphListItem;
  onClick: (p: ParagraphListItem) => void;
};

function ParagraphCard({ p, onClick }: ParagraphCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="card h-100 border shadow-sm"
      style={{ cursor: "pointer", transition: "box-shadow 0.2s, transform 0.2s" }}
      onClick={() => onClick(p)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(p);
        }
      }}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <span className={`badge rounded-pill ${p.isFree ? "bg-info" : "bg-dark"}`}>
            {p.isFree ? "Free" : "Paid"}
          </span>
          <span
            className={`badge rounded-pill ${p.solvedByUser ? "bg-success" : "bg-secondary bg-opacity-50"}`}
            title={p.solvedByUser ? "You've solved this paragraph" : "Not solved by you yet"}
          >
            {p.solvedByUser ? "Solved" : "Not solved"}
          </span>
        </div>
        <h3 className="h6 fw-bold text-dark mb-2">{p.title}</h3>
        <p className="mb-0 small text-secondary flex-grow-1">
          {p.solvedCount === 0
            ? "Not solved yet"
            : `${p.solvedCount} users completed`}
        </p>
      </div>
    </div>
  );
}

const CATEGORY_TITLES: Record<string, string> = {
  "/practice/lessons": "Lessons",
  "/practice/court-exam": "Court Exam Typing Practice",
  "/practice/mpsc": "MPSC Exam Typing",
};

const PATH_TO_CATEGORY: Record<string, "lessons" | "court-exam" | "mpsc"> = {
  "/practice/lessons": "lessons",
  "/practice/court-exam": "court-exam",
  "/practice/mpsc": "mpsc",
};

const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export function EnglishPracticePage() {
  const [page, setPage] = useState(1);
  const [price, setPrice] = useState<PriceFilter>("all");
  const [loginOpen, setLoginOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const limit = 12;
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const categoryTitle = CATEGORY_TITLES[location.pathname] ?? "English Typing Practice";
  const category = PATH_TO_CATEGORY[location.pathname];

  const handlePriceChange = (v: PriceFilter) => {
    setPrice(v);
    setPage(1);
  };

  const handleCardClick = (p: ParagraphListItem) => {
    if (p.isFree) {
      navigate(`/practice/english/${p._id}`);
      return;
    }
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!user.isPaid) {
      setPricingOpen(true);
      return;
    }
    navigate(`/practice/english/${p._id}`);
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["paragraphs", "english", category, price, page],
    queryFn: () =>
      fetchParagraphs({
        language: "english",
        ...(category && { category }),
        price,
        page,
        limit
      })
  });

  return (
    <main className="container py-5">
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <PricingDialog open={pricingOpen} onOpenChange={setPricingOpen} />
      <div className="mb-4">
        <Link to="/practice" className="text-primary text-decoration-none small">
          ← Back to practice
        </Link>
      </div>
      <div className="mb-4">
        <h1 className="display-6 fw-bold text-dark mb-2">{categoryTitle}</h1>
        <p className="text-muted mb-0">
          Start a focused session with English typing passages. Track your
          progress in real time.
        </p>
      </div>

      <div className="mb-4">
        <div className="row g-3 align-items-center flex-wrap">
          <div className="col-auto">
            <span className="text-muted small fw-semibold me-2">Price:</span>
            <div className="btn-group btn-group-sm" role="group" aria-label="Filter by price">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`btn ${price === opt.value ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => handlePriceChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="alert alert-danger" role="alert">
          {error instanceof Error ? error.message : "Failed to load paragraphs."}
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          {data.items.length === 0 ? (
            <div className="alert alert-info" role="alert">
              {price !== "all"
                ? "No paragraphs match your filters. Try different options."
                : "No English paragraphs yet. Check back later."}
            </div>
          ) : (
            <div className="row g-4 mb-4">
              {data.items.map((p) => (
                <div key={p._id} className="col-12 col-sm-6 col-lg-4">
                  <ParagraphCard p={p} onClick={handleCardClick} />
                </div>
              ))}
            </div>
          )}

          {data.items.length > 0 && data.totalPages > 1 && (
            <nav aria-label="Paragraphs pagination" className="d-flex justify-content-center">
              <ul className="pagination mb-0">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1}
                    aria-label="Previous"
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
                      setPage((prev) =>
                        Math.min(data.totalPages, prev + 1)
                      )
                    }
                    disabled={page >= data.totalPages}
                    aria-label="Next"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

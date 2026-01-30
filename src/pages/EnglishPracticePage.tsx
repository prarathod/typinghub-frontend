import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { LoginDialog } from "@/components/LoginDialog";
import { PricingDialog } from "@/components/PricingDialog";
import {
  fetchParagraphs,
  type ParagraphListItem,
  type PriceFilter,
} from "@/features/paragraphs/paragraphsApi";
import { hasAccessToParagraph } from "@/lib/access";
import { getProductIdForParagraph } from "@/lib/access";
import { useAuthStore } from "@/stores/authStore";

type ParagraphCardProps = {
  p: ParagraphListItem;
  onClick: (p: ParagraphListItem) => void;
};

const PARAGRAPH_CARD_CLASS =
  "bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 p-4 shadow-sm h-100 d-flex flex-column";

function ParagraphCard({ p, onClick }: ParagraphCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={PARAGRAPH_CARD_CLASS}
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
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <span className={`badge rounded-pill ${p.isFree ? "bg-success" : "bg-dark"}`}>
          {p.isFree ? "Free" : "Paid"}
        </span>
        <span
          className={`badge rounded-pill ${p.solvedByUser ? "bg-success" : "bg-secondary bg-opacity-50"}`}
          title={p.solvedByUser ? "You've solved this paragraph" : "Not solved by you yet"}
        >
          {p.solvedByUser ? "solved" : ""}
        </span>
      </div>
      <h3 className="h5 fw-bold text-dark mb-2">{p.title}</h3>

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

/** Parse "Lesson X.Y" or "X.Y" from title; return [major, minor] for sort. Non-matching titles get [Infinity, Infinity] so they sort last, then by title. */
function getLessonSortKey(title: string): [number, number] {
  const match = title.match(/(?:Lesson\s*)?(\d+)(?:\.(\d+))?/i) ?? title.match(/(\d+)\.(\d+)/);
  if (match) {
    const major = parseInt(match[1], 10);
    const minor = match[2] ? parseInt(match[2], 10) : 0;
    return [major, minor];
  }
  return [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
}

function lessonOrderComparator(a: ParagraphListItem, b: ParagraphListItem): number {
  const [aMajor, aMinor] = getLessonSortKey(a.title);
  const [bMajor, bMinor] = getLessonSortKey(b.title);
  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return a.title.localeCompare(b.title);
}

export function EnglishPracticePage() {
  const [page, setPage] = useState(1);
  const [price, setPrice] = useState<PriceFilter>("all");
  const [loginOpen, setLoginOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [pricingProductId, setPricingProductId] = useState<string | null>(null);
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
    if (!hasAccessToParagraph(user, p)) {
      setPricingProductId(getProductIdForParagraph(p.language, p.category));
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

  const displayItems =
    data?.items && category === "lessons"
      ? [...data.items].sort(lessonOrderComparator)
      : data?.items ?? [];

  return (
    <main className="container py-5">
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <PricingDialog
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        productId={pricingProductId}
      />
      <div
        className="mb-4"
        style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "0.75rem", alignItems: "center" }}
      >
        {/* <Link to="/practice" className="text-primary text-decoration-none small">
          ← Back to practice
        </Link> */}
        <h1
          className="display-6 fw-bold text-dark mb-0 text-center"
          style={{ gridColumn: "1 / -1" }}
        >
          {categoryTitle}
        </h1>
        <div />
      </div>
      <div className="mb-5 text-center">
        <p className="text-muted mb-0">
          Start a focused session with English typing passages. Track your
          progress in real time.
        </p>
      </div>

      <div className="mb-4">
        <div className="row g-3 align-items-center flex-wrap justify-content-center">
          <div className="col-auto">
            <span className="text-muted small fw-semibold me-2">Price:</span>
            <div className="btn-group btn-group-sm" role="group" aria-label="Filter by price">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`btn ${price === opt.value ? "btn-success" : "btn-outline-success"}`}
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
        <div className="alert alert-danger rounded-3" role="alert">
          {error instanceof Error ? error.message : "Failed to load paragraphs."}
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          {displayItems.length === 0 ? (
            <div className="alert alert-info rounded-3" role="alert">
              {price !== "all"
                ? "No paragraphs match your filters. Try different options."
                : "No English paragraphs yet. Check back later."}
            </div>
          ) : (
            <div className="row g-4 mb-4">
              {displayItems.map((p) => (
                <div key={p._id} className="col-6 col-sm-4 col-lg-2">
                  <ParagraphCard p={p} onClick={handleCardClick} />
                </div>
              ))}
            </div>
          )}

          {displayItems.length > 0 && data.totalPages > 1 && (
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

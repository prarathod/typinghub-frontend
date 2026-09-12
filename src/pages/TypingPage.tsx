import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { TypingPageErrorBoundary } from "@/components/TypingPageErrorBoundary";
import { CourtTypingUI } from "@/components/typing/CourtTypingUI";
import { HighCourtTypingUI } from "@/components/typing/HighCourtTypingUI";
import { LessonTypingUI } from "@/components/typing/LessonTypingUI";
import { MPSCTypingUI } from "@/components/typing/MPSCTypingUI";
import { fetchParagraphById } from "@/features/paragraphs/paragraphsApi";
import type { ParagraphDetail, ParagraphViewContext } from "@/features/paragraphs/paragraphsApi";
import { getDefaultProductIdForLanguage, getProductIdForParagraph, hasAccessToParagraph } from "@/lib/access";
import { useAuthStore } from "@/stores/authStore";

function renderTypingUI(paragraph: ParagraphDetail, forceHighCourtUI: boolean) {
  // Latest High Court reuses Court Exam's (or any category's) passages but always
  // renders with the split paragraph/typing layout, regardless of the passage's
  // own category.
  if (forceHighCourtUI) {
    return <HighCourtTypingUI paragraph={paragraph} />;
  }
  switch (paragraph.category) {
    case "lessons":
      return <LessonTypingUI paragraph={paragraph} />;
    case "court-exam":
      return <CourtTypingUI paragraph={paragraph} />;
    case "mpsc":
      return <MPSCTypingUI paragraph={paragraph} />;
    case "high-court":
      return <HighCourtTypingUI paragraph={paragraph} />;
    default:
      return <LessonTypingUI paragraph={paragraph} />;
  }
}

const CATEGORY_TO_PATH: Record<string, string> = {
  lessons: "/practice/lessons",
  "court-exam": "/practice/court-exam",
  mpsc: "/practice/mpsc",
  "high-court": "/practice/high-court"
};

export function TypingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const sessionInvalidated = useAuthStore((s) => s.sessionInvalidated);
  const [showTypingUI, setShowTypingUI] = useState(false);
  const prevStatusRef = useRef<string | undefined>(undefined);

  const navState = location.state as { backUrl?: string; forceHighCourtUI?: boolean } | null;
  // The URL's own "ctx" param is the durable signal — nav state is lost on a
  // hard refresh, ctrl/cmd-click into a new tab, copied link, or a shared
  // link, all ordinary usage for a paid link. Nav state is only a fallback
  // for in-app navigations that haven't been updated to set it.
  const ctxParam = searchParams.get("ctx");
  const forceHighCourtUI = ctxParam === "high-court" || (ctxParam == null && (navState?.forceHighCourtUI ?? false));
  const context: ParagraphViewContext = forceHighCourtUI ? "high-court" : "court-exam";

  const { data: paragraph, isLoading, isError, error, status } = useQuery({
    queryKey: ["paragraph", id, context],
    queryFn: () => fetchParagraphById(id!, context),
    enabled: Boolean(id),
    retry: (_, err) => {
      if (axios.isAxiosError(err) && err.response?.status === 403) return false;
      return true;
    }
  });

  const backUrl = navState?.backUrl
    ?? (forceHighCourtUI ? "/practice/high-court" : undefined)
    ?? (paragraph ? (CATEGORY_TO_PATH[paragraph.category] ?? "/practice/lessons") : "/practice/lessons");

  const is403 = axios.isAxiosError(error) && error.response?.status === 403;
  const showLoading = status === "pending" || isLoading || (status === "success" && !paragraph);

  // Paid passage: 1) not logged in → LoginDialog; 2) logged in but no subscription → Get Access (PricingDialog)
  // Computed here (guarded for a not-yet-loaded paragraph) so every hook below can be called
  // unconditionally on every render — hooks must never be skipped by an early return above them.
  const hasAccess = paragraph ? hasAccessToParagraph(user, paragraph, context) : false;
  const paidProductId = paragraph
    ? getProductIdForParagraph(paragraph.language, paragraph.category, context) ?? getDefaultProductIdForLanguage(paragraph.language)
    : null;
  const notLoggedIn = !user;

  useEffect(() => {
    if (isError && is403) {
      navigate("/practice/lessons", {
        replace: true,
        state: user ? { openPricing: true } : { openLogin: true }
      });
    }
  }, [isError, is403, user, navigate]);

  useEffect(() => {
    if (!showLoading && !isError && paragraph && !hasAccess && !sessionInvalidated) {
      navigate(backUrl, {
        replace: true,
        state: notLoggedIn
          ? { openLogin: true }
          : { openPricing: true, productId: paidProductId ?? undefined }
      });
    }
  }, [showLoading, isError, paragraph, hasAccess, notLoggedIn, paidProductId, sessionInvalidated, navigate, backUrl]);

  // Defer mounting typing UI by one frame when we just transitioned from loading → success,
  // so DOM/layout is settled and Radix/refs don’t throw on first click from list.
  useLayoutEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (status === "success" && paragraph && paragraph._id === id) {
      if (prev === "pending") {
        // One-frame defer when transitioning from loading → content (avoids first-click error when no cache)
        const idRAF = requestAnimationFrame(() => setShowTypingUI(true));
        return () => cancelAnimationFrame(idRAF);
      }
      setShowTypingUI(true);
    } else {
      setShowTypingUI(false);
    }
  }, [status, paragraph, id]);

  if (!id) {
    return (
      <main className="container py-5">
        <div className="alert alert-warning">Invalid practice link.</div>
        <Link to="/practice" className="btn btn-outline-primary mt-3">
          Back to practice
        </Link>
      </main>
    );
  }

  if (showLoading) {
    return (
      <main
        className="container py-5 d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", backgroundColor: "#fff", width: "100%" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0" style={{ color: "#212529", fontSize: "1rem" }}>
            Loading lesson…
          </p>
        </div>
      </main>
    );
  }

  if (isError || !paragraph) {
    // 403: redirect to practice list; popup opens there (handled by EnglishPracticePage)
    if (is403) {
      return (
        <main className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: "80vh", backgroundColor: "#fff" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Redirecting</span>
            </div>
            <p className="text-muted small mb-0">Redirecting…</p>
          </div>
        </main>
      );
    }
    // Other errors: minimal message + back link
    return (
      <main className="container py-5">
        <p className="text-muted small mb-2">
          {error instanceof Error ? error.message : "Failed to load paragraph."}
        </p>
        <Link to="/practice" className="btn btn-link ps-0">
          ← Back to practice
        </Link>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: "80vh", backgroundColor: "#fff" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Redirecting</span>
          </div>
          <p className="text-muted small mb-0">Redirecting…</p>
        </div>
      </main>
    );
  }

  const lessonText = typeof paragraph.text === "string" ? paragraph.text : "";
  if (!lessonText.trim()) {
    return (
      <main className="container py-5" style={{ backgroundColor: "#fff", minHeight: "80vh" }}>
        <div className="alert alert-warning">
          This lesson has no content yet. Please try another lesson.
        </div>
        <Link to={backUrl} className="btn btn-outline-primary mt-2">
          ← Back
        </Link>
      </main>
    );
  }

  // Only render typing UI when paragraph matches URL (avoids stale data from cache).
  if (paragraph._id !== id) {
    return (
      <main
        className="container py-5 d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", backgroundColor: "#fff", width: "100%" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0" style={{ color: "#212529", fontSize: "1rem" }}>
            Loading lesson…
          </p>
        </div>
      </main>
    );
  }

  if (!showTypingUI) {
    return (
      <main
        className="container py-5 d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", backgroundColor: "#fff", width: "100%" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0" style={{ color: "#212529", fontSize: "1rem" }}>
            Loading lesson…
          </p>
        </div>
      </main>
    );
  }

  return (
    <TypingPageErrorBoundary>
      <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
        {renderTypingUI(paragraph, forceHighCourtUI)}
      </div>
    </TypingPageErrorBoundary>
  );
}

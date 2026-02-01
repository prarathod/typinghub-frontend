import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { CourtTypingUI } from "@/components/typing/CourtTypingUI";
import { LessonTypingUI } from "@/components/typing/LessonTypingUI";
import { MPSCTypingUI } from "@/components/typing/MPSCTypingUI";
import { fetchParagraphById } from "@/features/paragraphs/paragraphsApi";
import type { ParagraphDetail } from "@/features/paragraphs/paragraphsApi";
import { getProductIdForParagraph, hasAccessToParagraph } from "@/lib/access";
import { useAuthStore } from "@/stores/authStore";

function renderTypingUI(paragraph: ParagraphDetail) {
  switch (paragraph.category) {
    case "lessons":
      return <LessonTypingUI paragraph={paragraph} />;
    case "court-exam":
      return <CourtTypingUI paragraph={paragraph} />;
    case "mpsc":
      return <MPSCTypingUI paragraph={paragraph} />;
    default:
      return <LessonTypingUI paragraph={paragraph} />;
  }
}

const CATEGORY_TO_PATH: Record<string, string> = {
  lessons: "/practice/lessons",
  "court-exam": "/practice/court-exam",
  mpsc: "/practice/mpsc"
};

export function TypingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: paragraph, isLoading, isError, error } = useQuery({
    queryKey: ["paragraph", id],
    queryFn: () => fetchParagraphById(id!),
    enabled: Boolean(id),
    retry: (_, err) => {
      if (axios.isAxiosError(err) && err.response?.status === 403) return false;
      return true;
    }
  });

  const is403 = axios.isAxiosError(error) && error.response?.status === 403;

  useEffect(() => {
    if (isError && is403) {
      navigate("/practice/lessons", {
        replace: true,
        state: user ? { openPricing: true } : { openLogin: true }
      });
    }
  }, [isError, is403, user, navigate]);

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

  if (isLoading) {
    return (
      <main className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !paragraph) {
    // 403: redirect to practice list; popup opens there (handled by EnglishPracticePage)
    if (is403) return null;
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

  // Paid passage: 1) not logged in → LoginDialog; 2) logged in but no subscription → Get Access (PricingDialog)
  const hasAccess = hasAccessToParagraph(user, paragraph);
  const paidProductId = getProductIdForParagraph(paragraph.language, paragraph.category);
  const notLoggedIn = !user;

  useEffect(() => {
    if (!hasAccess && paragraph) {
      const listPath = CATEGORY_TO_PATH[paragraph.category] ?? "/practice/lessons";
      navigate(listPath, {
        replace: true,
        state: notLoggedIn
          ? { openLogin: true }
          : { openPricing: true, productId: paidProductId ?? undefined }
      });
    }
  }, [hasAccess, paragraph, notLoggedIn, paidProductId, navigate]);

  if (!hasAccess) return null;

  return <>{renderTypingUI(paragraph)}</>;
}

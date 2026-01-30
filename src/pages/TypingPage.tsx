import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { PricingDialog } from "@/components/PricingDialog";
import { CourtTypingUI } from "@/components/typing/CourtTypingUI";
import { MPSCTypingUI } from "@/components/typing/MPSCTypingUI";
import { fetchParagraphById } from "@/features/paragraphs/paragraphsApi";
import type { ParagraphDetail } from "@/features/paragraphs/paragraphsApi";

function renderTypingUI(paragraph: ParagraphDetail) {
  switch (paragraph.category) {
    case "lessons":
    case "court-exam":
      return <CourtTypingUI paragraph={paragraph} />;
    case "mpsc":
      return <MPSCTypingUI paragraph={paragraph} />;
    default:
      return <CourtTypingUI paragraph={paragraph} />;
  }
}

export function TypingPage() {
  const { id } = useParams<{ id: string }>();
  const [pricingOpen, setPricingOpen] = useState(false);

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
    return (
      <main className="container py-5">
        <PricingDialog open={pricingOpen} onOpenChange={setPricingOpen} />
        <div className="alert alert-warning">
          {is403
            ? "You don't have access to this passage. Unlock the course to practice."
            : error instanceof Error
              ? error.message
              : "Failed to load paragraph."}
        </div>
        {is403 && (
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={() => setPricingOpen(true)}
          >
            View pricing
          </button>
        )}
        <Link to="/practice" className="btn btn-outline-primary mt-3 ms-2">
          Back to practice
        </Link>
      </main>
    );
  }

  return <>{renderTypingUI(paragraph)}</>;
}

import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { CourtTypingUI } from "@/components/typing/CourtTypingUI";
import { LessonTypingUI } from "@/components/typing/LessonTypingUI";
import { MPSCTypingUI } from "@/components/typing/MPSCTypingUI";
import { fetchParagraphById } from "@/features/paragraphs/paragraphsApi";
import type { ParagraphDetail } from "@/features/paragraphs/paragraphsApi";

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

export function TypingPage() {
  const { id } = useParams<{ id: string }>();

  const { data: paragraph, isLoading, isError, error } = useQuery({
    queryKey: ["paragraph", id],
    queryFn: () => fetchParagraphById(id!),
    enabled: Boolean(id)
  });

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
        <div className="alert alert-danger">
          {error instanceof Error ? error.message : "Failed to load paragraph."}
        </div>
        <Link to="/practice" className="btn btn-outline-primary mt-3">
          Back to practice
        </Link>
      </main>
    );
  }

  return <>{renderTypingUI(paragraph)}</>;
}

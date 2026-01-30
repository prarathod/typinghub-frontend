import { Link } from "react-router-dom";
import type { ParagraphDetail } from "@/features/paragraphs/paragraphsApi";

type MPSCTypingUIProps = {
  paragraph: ParagraphDetail;
};

export function MPSCTypingUI({ paragraph }: MPSCTypingUIProps) {
  return (
    <main className="container py-5">
      <div
        className="mb-4"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "0.75rem",
          alignItems: "center"
        }}
      >
        <Link to="/practice/mpsc" className="text-primary text-decoration-none small">
          ← Back to practice
        </Link>
        <h1 className="display-6 fw-bold text-dark mb-0 text-center">
          {paragraph.title}
        </h1>
        <div />
      </div>
      <div className="alert alert-info">
        <strong>MPSC paragraph typing UI</strong> — Coming soon. This will have
        a dedicated layout for MPSC exam typing practice.
      </div>
      <div
        className="bg-light rounded-3 p-4 font-monospace small"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {paragraph.text}
      </div>
    </main>
  );
}

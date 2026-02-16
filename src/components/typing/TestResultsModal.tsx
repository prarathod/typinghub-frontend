import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { TypingMetrics } from "@/lib/typingMetrics";
import { ViewDetailsSection } from "@/components/typing/ViewDetailsSection";
import { alignWords, getWordSegments, splitWords as splitWordsUtil } from "@/lib/wordHighlighting";

function formatTimeLong(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (m > 0) parts.push(`${m} minute(s)`);
  parts.push(`${s} second(s)`);
  return parts.join(" ");
}

/** Small teal right-pointing triangular arrow before each metric. */
function MetricArrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="#0d9488" className="flex-shrink-0 me-2" style={{ marginTop: "2px" }} aria-hidden>
      <path d="M8 4l12 8-12 8V4z" />
    </svg>
  );
}

/** Renders user input in black (no correct/incorrect coloring). */
function UserInputHighlighted({
  userInput
}: {
  userInput: string;
  expectedText: string;
}) {
  return <>{userInput}</>;
}

/** Renders expected paragraph with correct (green), incorrect (red), omitted (orange + strikethrough). */
function ExpectedParagraphHighlighted({
  expectedText,
  userInput
}: {
  expectedText: string;
  userInput: string;
}) {
  if (typeof expectedText !== "string") return null;
  const targetWords = splitWordsUtil(expectedText);
  const typedWords = splitWordsUtil(userInput.trim());
  const aligned = alignWords(targetWords, typedWords, { caseSensitive: true });
  const statusByIndex = new Map(aligned.map((a) => [a.wordIndex, a.status]));
  const segments = getWordSegments(expectedText);

  return (
    <>
      {segments.map((seg, i) => {
        if (!seg.isWord) return <span key={i}>{seg.text}</span>;
        const status = statusByIndex.get(seg.wordIndex);
        const color =
          status === "correct"
            ? "#15803d"
            : status === "incorrect"
              ? "#b91c1c"
              : status === "omitted"
                ? "#c2410c"
                : "#374151";
        return (
          <span
            key={i}
            style={{
              color,
              textDecoration: status === "omitted" ? "line-through" : undefined,
              padding: "0 1px",
              borderRadius: "2px"
            }}
          >
            {seg.text}
          </span>
        );
      })}
    </>
  );
}

type TestResultsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: TypingMetrics | null;
  paragraphId: string;
  /** When provided, User Input section highlights correct vs incorrect words. */
  expectedText?: string;
  /** When true, show Total Keystrokes in the results (e.g. for MPSC). */
  showTotalKeystrokes?: boolean;
  onRetry?: () => void;
  onNext?: () => void;
  /** Portal container - use fullscreen element when in fullscreen so modal displays correctly */
  portalContainer?: HTMLElement | null;
};

export function TestResultsModal({
  open,
  onOpenChange,
  metrics,
  paragraphId,
  expectedText,
  showTotalKeystrokes,
  onRetry,
  onNext,
  portalContainer
}: TestResultsModalProps) {
  const [showViewDetails, setShowViewDetails] = useState(false);
  useEffect(() => {
    if (open) setShowViewDetails(false);
  }, [open]);
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);
  if (!metrics) return null;

  const handleRetry = () => {
    onRetry?.();
    onOpenChange(false);
  };

  const handleNext = () => {
    onNext?.();
    onOpenChange(false);
  };

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        container={portalContainer}
        className="max-w-[90vw] max-h-[90vh] overflow-y-auto border-2 border-dark box-border"
        style={{
          margin: "1.5rem",
          padding: "1.5rem 1.75rem",
          borderRightWidth: "2px",
          borderRightStyle: "solid",
          borderRightColor: "#212529"
        }}
        aria-describedby="test-results-description"
      >
        <DialogHeader className="position-relative mb-4 pb-0">
          <div
            className="text-center py-3 px-4 rounded-3 mx-auto"
            style={{
              border: "2px solid #0d9488",
              maxWidth: "fit-content"
            }}
          >
            <DialogTitle
              className="text-xl fw-bold mb-0"
              style={{ color: "#8b1538" }}
            >
              TEST RESULTS
            </DialogTitle>
          </div>
          <button
            type="button"
            className="btn btn-link p-0 position-absolute top-0 end-0 text-secondary text-decoration-none"
            onClick={handleClose}
            aria-label="Close"
            style={{ fontSize: "1.5rem", lineHeight: 1 }}
          >
            <span aria-hidden>×</span>
          </button>
        </DialogHeader>
        <div
          id="test-results-description"
          className="text-dark"
          style={{ paddingTop: "0.25rem", paddingBottom: "0.5rem", fontSize: "1.0625rem" }}
        >
          <div
            className="row g-0 mb-4"
            style={{
              border: "1px solid #212529",
              borderRadius: "0.5rem",
              overflow: "hidden"
            }}
          >
            <div
              className="col-6 p-3"
              style={{
                borderRight: "1px solid #212529",
                fontSize: "1.0625rem"
              }}
            >
              <ul className="list-unstyled mb-0">
                <li className="mb-2 d-flex align-items-start">
                  <MetricArrow />
                  <span><strong>Time Taken :</strong> {formatTimeLong(metrics.timeTakenSeconds)}</span>
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <MetricArrow />
                  <span><strong>Total Typed words :</strong> {metrics.wordsTyped}</span>
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <MetricArrow />
                  <span><strong>Correct Words :</strong> {metrics.correctWordsCount}</span>
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <MetricArrow />
                  <span><strong>Incorrect Words :</strong> {metrics.incorrectWordsCount}</span>
                </li>
                <li className="d-flex align-items-start">
                  <MetricArrow />
                  <span><strong>Omitted Words :</strong> {metrics.omittedWordsCount}</span>
                </li>
              </ul>
            </div>
            <div className="col-6 p-3" style={{ fontSize: "1.0625rem" }}>
              <ul className="list-unstyled mb-0">
                <li className="mb-2 d-flex align-items-start">
                  <MetricArrow />
                  <span><strong>Accuracy :</strong> {metrics.accuracy}%</span>
                </li>
                {showTotalKeystrokes && (
                  <li className="mb-2 d-flex align-items-start">
                    <MetricArrow />
                    <span><strong>Total Keystrokes :</strong> {metrics.totalKeystrokes}</span>
                  </li>
                )}
                <li className="mb-2 d-flex align-items-start">
                  <MetricArrow />
                  <span><strong>Keystrokes Per Minute :</strong> {metrics.kpm}</span>
                </li>
                <li className="d-flex align-items-start">
                  <MetricArrow />
                  <span><strong>Words Per Minute :</strong> {metrics.wpm}</span>
                </li>
              </ul>
            </div>
          </div>
          <p className="small mb-0 mt-2" style={{ fontStyle: "italic", color: "#b02a37" }}>
            Note: In examinations, omitted words are also calculated as incorrect words.
          </p>
          <div className="mt-4 mb-3">
            <strong className="text-dark">User Input:</strong>
            <div
              className="mt-2 p-3 rounded font-monospace small text-break"
              style={{
                whiteSpace: "pre-wrap",
                maxHeight: "160px",
                overflowY: "auto",
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6"
              }}
            >
              {expectedText && metrics.userInput ? (
                <UserInputHighlighted
                  userInput={metrics.userInput}
                  expectedText={expectedText}
                />
              ) : (
                metrics.userInput || "(none)"
              )}
            </div>
          </div>
          {expectedText && (
            <div className="mt-4 mb-3">
              <strong className="text-dark">User Paragraph:</strong>
              <div
                className="mt-2 p-3 rounded font-monospace small text-break"
                style={{
                  whiteSpace: "pre-wrap",
                  maxHeight: "160px",
                  overflowY: "auto",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6"
                }}
              >
                <ExpectedParagraphHighlighted
                  expectedText={expectedText}
                  userInput={metrics.userInput}
                />
              </div>
            </div>
          )}
        </div>
        <div className="d-flex flex-wrap justify-content-center pt-3 pb-1" style={{ gap: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRetry}
          >
            Retry
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleNext}
          >
            Next
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClose}
          >
            Close
          </button>
        </div>

        <div className="mt-3 pt-3 border-top border-secondary text-center">
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0"
            onClick={() => setShowViewDetails((v) => !v)}
          >
            {showViewDetails ? "▼ Hide" : "▶ View Details"} — Top 10, your standing, history
          </button>
        </div>

        {showViewDetails && (
          <ViewDetailsSection paragraphId={paragraphId} currentMetrics={metrics} />
        )}
      </DialogContent>
    </Dialog>
  );
}

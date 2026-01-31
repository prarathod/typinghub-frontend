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

function splitWords(s: string): string[] {
  return s.split(/\s+/).filter(Boolean);
}

/** Renders user input with correct (green) and incorrect (red) word highlighting when expectedText is provided. */
function UserInputHighlighted({
  userInput,
  expectedText
}: {
  userInput: string;
  expectedText: string;
}) {
  const expectedWords = splitWords(expectedText);
  const tokens = userInput.split(/(\s+)/);
  let wordIndex = 0;
  return (
    <>
      {tokens.map((t, i) => {
        if (/^\s+$/.test(t)) return <span key={i}>{t}</span>;
        const isCorrect =
          expectedWords[wordIndex] !== undefined && t === expectedWords[wordIndex];
        wordIndex++;
        return (
          <span
            key={i}
            style={{
              color: isCorrect ? "#15803d" : "#b91c1c",
              padding: "0 1px",
              borderRadius: "2px"
            }}
          >
            {t}
          </span>
        );
      })}
    </>
  );
}

/** Renders expected paragraph with correct (green), incorrect (red), omitted (orange + strikethrough). */
function ExpectedParagraphHighlighted({
  expectedText,
  userInput
}: {
  expectedText: string;
  userInput: string;
}) {
  const targetWords = splitWordsUtil(expectedText);
  const typedWords = splitWordsUtil(userInput.trim());
  const aligned = alignWords(targetWords, typedWords, { caseSensitive: false });
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
          className="small text-dark"
          style={{ paddingTop: "0.25rem", paddingBottom: "0.5rem" }}
        >
          <div className="row g-4 mb-4">
            <div className="col-6">
              <ul className="list-unstyled mb-0">
                <li className="mb-3">
                  <strong>Time Taken:</strong>{" "}
                  {formatTimeLong(metrics.timeTakenSeconds)}
                </li>
                <li className="mb-3">
                  <strong>Total Typed words:</strong> {metrics.wordsTyped}
                </li>
                <li className="mb-3">
                  <strong>Correct Words:</strong> {metrics.correctWordsCount}
                </li>
                <li className="mb-3">
                  <strong>Accuracy:</strong> {metrics.accuracy}%
                </li>
              </ul>
            </div>
            <div className="col-6">
              <ul className="list-unstyled mb-0">
                <li className="mb-3">
                  <strong>Incorrect Words:</strong> {metrics.incorrectWordsCount}
                </li>
                <li className="mb-3">
                  <strong>Omitted Words:</strong> {metrics.omittedWordsCount}
                </li>
                <li className="mb-3">
                  <strong>Keystrokes Per Minute:</strong> {metrics.kpm}
                </li>
                <li className="mb-3">
                  <strong>Words Per Minute:</strong> {metrics.wpm}
                </li>
              </ul>
            </div>
          </div>
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

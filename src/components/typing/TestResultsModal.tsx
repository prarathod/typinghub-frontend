import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { TypingMetrics } from "@/lib/typingMetrics";
import { ViewDetailsSection } from "@/components/typing/ViewDetailsSection";

function formatTimeLong(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (m > 0) parts.push(`${m} minute(s)`);
  parts.push(`${s} second(s)`);
  return parts.join(" ");
}

function isOmitted(word: string): boolean {
  return /^\[omitted:/.test(word);
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

type TestResultsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: TypingMetrics | null;
  paragraphId: string;
  /** When provided, User Input section highlights correct vs incorrect words. */
  expectedText?: string;
  onRetry?: () => void;
  onNext?: () => void;
};

export function TestResultsModal({
  open,
  onOpenChange,
  metrics,
  paragraphId,
  expectedText,
  onRetry,
  onNext
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

  const incorrectWordsOnly = metrics.incorrectWords.filter((w) => !isOmitted(w));

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
        <DialogHeader className="d-flex flex-row justify-content-between align-items-start border-bottom border-secondary pb-3 mb-4">
          <DialogTitle
            className="text-xl fw-bold mb-0"
            style={{ color: "#8b1538" }}
          >
            TEST RESULTS
          </DialogTitle>
          <button
            type="button"
            className="btn btn-link p-0 ms-2 text-secondary text-decoration-none align-self-center"
            onClick={handleClose}
            aria-label="Close"
            style={{ fontSize: "1.5rem", lineHeight: 1 }}
          >
            <span aria-hidden>×</span>
          </button>
        </DialogHeader>
        <div
          id="test-results-description"
          className="small text-dark px-1"
          style={{ paddingTop: "0.25rem", paddingBottom: "0.5rem" }}
        >
          <ul className="list-unstyled mb-0">
            <li className="mb-3">
              <strong>Time Taken:</strong>{" "}
              {formatTimeLong(metrics.timeTakenSeconds)}
            </li>
            <li className="mb-3">
              <strong>Accuracy:</strong> {metrics.accuracy}%
            </li>
            <li className="mb-3">
              <strong>Total Keystrokes:</strong> {metrics.totalKeystrokes}
            </li>
            <li className="mb-3">
              <strong>Backspace Count:</strong> {metrics.backspaceCount}
            </li>
            <li className="mb-3">
              <strong>Number of Words Typed:</strong> {metrics.wordsTyped}
            </li>
            <li className="mb-3">
              <strong>Words Per Minute:</strong> {metrics.wpm}
            </li>
            <li className="mb-3">
              <strong>Keystrokes Per Minute:</strong> {metrics.kpm}
            </li>
            <li className="mb-3">
              <strong>No. Of Incorrect Words:</strong>{" "}
              {metrics.incorrectWordsCount}
            </li>
            {incorrectWordsOnly.length > 0 && (
              <li className="mb-3">
                <strong>Incorrect Words:</strong>{" "}
                <span className="text-danger">
                  {incorrectWordsOnly.join(", ")}
                </span>
              </li>
            )}
            <li className="mb-3">
              <strong>Total Correct Words Typed:</strong>{" "}
              {metrics.correctWordsCount}
            </li>
          </ul>
          <div className="mt-4 mb-3">
            <strong>User Input:</strong>
            <div
              className="mt-2 p-3 rounded border bg-light font-monospace small text-break"
              style={{
                whiteSpace: "pre-wrap",
                maxHeight: "160px",
                overflowY: "auto"
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

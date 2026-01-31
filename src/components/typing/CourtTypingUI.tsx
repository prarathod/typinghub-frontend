import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";

import { TestResultsModal } from "@/components/typing/TestResultsModal";
import { submitTypingResult } from "@/features/paragraphs/paragraphsApi";
import type { ParagraphDetail } from "@/features/paragraphs/paragraphsApi";
import { computeTypingMetrics, type TypingMetrics } from "@/lib/typingMetrics";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      className="flex-shrink-0"
      aria-hidden
    >
      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
    </svg>
  );
}

const AUTO_SUBMIT_OPTIONS = [
  { value: 10 * 60, label: "10 minutes" },
  { value: 15 * 60, label: "15 minutes" },
  { value: 30 * 60, label: "30 minutes" },
  { value: 0, label: "Off" }
] as const;

type CourtTypingUIProps = {
  paragraph: ParagraphDetail;
};

export function CourtTypingUI({ paragraph }: CourtTypingUIProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [autoSubmitSeconds, setAutoSubmitSeconds] = useState(10 * 60);
  const [isStarted, setIsStarted] = useState(false);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsMetrics, setResultsMetrics] = useState<TypingMetrics | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSubmitTriggeredRef = useRef(false);
  const inputRef = useRef(input);
  const totalKeystrokesRef = useRef(totalKeystrokes);
  const backspaceCountRef = useRef(backspaceCount);
  const timerSecondsRef = useRef(timerSeconds);

  useEffect(() => {
    inputRef.current = input;
    totalKeystrokesRef.current = totalKeystrokes;
    backspaceCountRef.current = backspaceCount;
    timerSecondsRef.current = timerSeconds;
  }, [input, totalKeystrokes, backspaceCount, timerSeconds]);

  const submitCurrentAttempt = useCallback(async () => {
    if (hasSubmitted || autoSubmitTriggeredRef.current) return;
    autoSubmitTriggeredRef.current = true;
    setHasSubmitted(true);
    setTimerStarted(false);
    const currentInput = inputRef.current;
    const currentKeystrokes = totalKeystrokesRef.current;
    const currentBackspace = backspaceCountRef.current;
    const currentTime = timerSecondsRef.current;
    const metrics = computeTypingMetrics(
      paragraph.text,
      currentInput,
      currentTime,
      currentKeystrokes,
      currentBackspace,
      paragraph.language
    );
    setResultsMetrics(metrics);
    setResultsOpen(true);
    try {
      await submitTypingResult(paragraph._id, {
        timeTakenSeconds: metrics.timeTakenSeconds,
        accuracy: metrics.accuracy,
        totalKeystrokes: metrics.totalKeystrokes,
        backspaceCount: metrics.backspaceCount,
        wordsTyped: metrics.wordsTyped,
        wpm: metrics.wpm,
        kpm: metrics.kpm,
        incorrectWordsCount: metrics.incorrectWordsCount,
        incorrectWords: metrics.incorrectWords,
        correctWordsCount: metrics.correctWordsCount,
        userInput: metrics.userInput
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leaderboard", paragraph._id] }),
        queryClient.invalidateQueries({ queryKey: ["history", paragraph._id] }),
        queryClient.invalidateQueries({ queryKey: ["paragraphs"] })
      ]);
    } catch (err) {
      console.error("Failed to store submission:", err);
    }
  }, [hasSubmitted, paragraph.text, paragraph._id, paragraph.language, queryClient]);

  useEffect(() => {
    if (!timerStarted || hasSubmitted || autoSubmitTriggeredRef.current) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => {
        const next = s + 1;
        if (autoSubmitSeconds > 0 && next >= autoSubmitSeconds && !autoSubmitTriggeredRef.current) {
          submitCurrentAttempt();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerStarted, hasSubmitted, autoSubmitSeconds, submitCurrentAttempt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (hasSubmitted || !isStarted) return;
    const next = e.target.value;
    const delta = next.length - input.length;
    if (delta > 0) setTotalKeystrokes((k) => k + delta);
    setInput(next);
    if (next.length > 0 && !timerStarted) setTimerStarted(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (hasSubmitted || !isStarted) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      setBackspaceCount((c) => c + 1);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    setTimerStarted(true);
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (hasSubmitted || autoSubmitTriggeredRef.current) return;
    await submitCurrentAttempt();
  };

  const handleRestart = () => {
    setInput("");
    setTimerSeconds(0);
    setTimerStarted(false);
    setHasSubmitted(false);
    setIsStarted(false);
    setTotalKeystrokes(0);
    setBackspaceCount(0);
    setResultsOpen(false);
    setResultsMetrics(null);
    autoSubmitTriggeredRef.current = false;
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    
    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Title:", 14, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    const titleLines = doc.splitTextToSize(paragraph.title, 180);
    doc.text(titleLines, 14, yPos);
    yPos += titleLines.length * 6 + 5;
    
    // Instruction
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Start typing from below:", 14, yPos);
    yPos += 8;
    
    // Paragraph text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(paragraph.text, 180);
    doc.text(lines, 14, yPos);
    
    doc.save(`${paragraph.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
  };

  return (
    <main className="container py-4">
      <TestResultsModal
        open={resultsOpen}
        onOpenChange={setResultsOpen}
        metrics={resultsMetrics}
        paragraphId={paragraph._id}
        expectedText={paragraph.text}
        onRetry={handleRestart}
        onNext={() => navigate(`/practice/${paragraph.category}`)}
      />
      {!isStarted ? (
        <>
          <div
            className="mb-3"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: "0.75rem",
              alignItems: "center"
            }}
          >
            <div />
            <h1 className="h4 fw-bold text-dark mb-0 text-center">
              {paragraph.title}
            </h1>
            <div />
          </div>

          <div className="card border shadow-sm mb-3">
            <div className="card-body">
              <h2 className="h6 fw-semibold mb-3">Paragraph to type</h2>
              <div
                className="font-monospace overflow-auto rounded-3 p-4 mb-0"
                style={{
                  whiteSpace: "pre-wrap",
                  minHeight: "200px",
                  maxHeight: "400px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: "#1a1a1a"
                }}
              >
                {paragraph.text}
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-3 mb-3 p-3 rounded-3 bg-light">
            <label className="d-flex align-items-center gap-2 small mb-0">
              <input
                type="checkbox"
                checked={showTimer}
                onChange={(e) => setShowTimer(e.target.checked)}
                className="form-check-input"
              />
              <span>Show timer</span>
            </label>
            <div className="d-flex align-items-center gap-2">
              <label className="small mb-0">Auto submit:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={autoSubmitSeconds}
                onChange={(e) => setAutoSubmitSeconds(Number(e.target.value))}
                disabled={isStarted}
              >
                {AUTO_SUBMIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStart}
              disabled={isStarted}
            >
              Start Paragraph
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleDownloadPDF}
            >
              Download Paragraph PDF
            </button>
          </div>
        </>
      ) : (
        <div
          className="mb-3"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "0.75rem",
            alignItems: "center"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <label className="d-flex align-items-center gap-2 small mb-0">
              <input
                type="checkbox"
                checked={showTimer}
                onChange={(e) => setShowTimer(e.target.checked)}
                className="form-check-input"
              />
              <span>Show timer</span>
            </label>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
          <h1 className="h4 fw-bold text-dark mb-0 text-center">
            {paragraph.title}
          </h1>
          <div className="d-flex justify-content-end">
            {showTimer && (
              <span
                className="d-inline-flex align-items-center gap-2 rounded-3 px-3 py-2 font-monospace"
                role="timer"
                aria-live="polite"
                style={{ backgroundColor: "#fae8e8", color: "#ff3131" }}
              >
                <ClockIcon />
                {formatTime(timerSeconds)}
              </span>
            )}
          </div>
        </div>
      )}

      {isStarted && (
        <div style={{ width: "70%", maxWidth: "70%", marginLeft: "auto", marginRight: "auto" }}>
          <div
            className="card border"
            style={{
              boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.15)"
            }}
          >
            <div className="card-body p-0">
              {hasSubmitted && (
                <div className="d-flex justify-content-end p-2 border-bottom">
                  <span className="badge bg-success">
                    Done · {formatTime(timerSeconds)}
                  </span>
                </div>
              )}
              <textarea
                ref={textareaRef}
                className="form-control font-monospace border-0"
                rows={12}
                placeholder="Start typing the paragraph..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                disabled={hasSubmitted}
                autoFocus
                aria-label="Typing input"
                style={{ fontSize: "16px", lineHeight: 1.6, padding: 4, minHeight: "80vh" }}
              />
            </div>
          </div>
          <div className="d-flex justify-content-center mt-4 mb-3">
            <button
              type="button"
              className="btn btn-primary btn-lg px-5"
              onClick={handleSubmit}
              disabled={hasSubmitted}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

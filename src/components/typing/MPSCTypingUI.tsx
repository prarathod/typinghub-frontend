import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { TestResultsModal } from "@/components/typing/TestResultsModal";
import { submitTypingResult } from "@/features/paragraphs/paragraphsApi";
import type { ParagraphDetail } from "@/features/paragraphs/paragraphsApi";
import { computeTypingMetrics, type TypingMetrics } from "@/lib/typingMetrics";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const FONT_SIZES = [14, 16, 18, 20, 22] as const;
const DEFAULT_FONT_INDEX = 1;

type MPSCTypingUIProps = {
  paragraph: ParagraphDetail;
};

export function MPSCTypingUI({ paragraph }: MPSCTypingUIProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [enableHighlight, setEnableHighlight] = useState(true);
  const [enableBackspace, setEnableBackspace] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_INDEX);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsMetrics, setResultsMetrics] = useState<TypingMetrics | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!timerStarted || hasSubmitted) return;
    const id = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerStarted, hasSubmitted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (hasSubmitted) return;
    const next = e.target.value;
    const delta = next.length - input.length;
    if (delta > 0) setTotalKeystrokes((k) => k + delta);
    setInput(next);
    if (next.length > 0 && !timerStarted) setTimerStarted(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (hasSubmitted) return;
    if (!enableBackspace && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      return;
    }
    if (enableBackspace && e.key === "Backspace")
      setBackspaceCount((c) => c + 1);
  };

  const handleRestart = () => {
    setInput("");
    setTimerSeconds(0);
    setTimerStarted(false);
    setHasSubmitted(false);
    setTotalKeystrokes(0);
    setBackspaceCount(0);
    setResultsOpen(false);
    setResultsMetrics(null);
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);
    const metrics = computeTypingMetrics(
      paragraph.text,
      input,
      timerSeconds,
      totalKeystrokes,
      backspaceCount,
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
  };

  const toggleFullScreen = async () => {
    const el = fullscreenRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullScreen(false);
      } else {
        await el.requestFullscreen();
        setIsFullScreen(true);
      }
    } catch {
      setIsFullScreen(!!document.fullscreenElement);
    }
  };

  useEffect(() => {
    const onFullScreenChange = () =>
      setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullScreenChange);
  }, []);

  const fontSize = FONT_SIZES[fontSizeIndex];
  const text = paragraph.text;
  const chars = [...text];

  return (
    <main className="container py-4">
      <TestResultsModal
        open={resultsOpen}
        onOpenChange={setResultsOpen}
        metrics={resultsMetrics}
        paragraphId={paragraph._id}
        expectedText={paragraph.text}
        onRetry={handleRestart}
        onNext={() => navigate("/practice/mpsc")}
      />
      <div
        ref={fullscreenRef}
        className="typing-lesson-root"
        style={
          isFullScreen
            ? { minHeight: "100vh", backgroundColor: "#fff", padding: "1rem" }
            : undefined
        }
      >
        <div
          className="mb-3"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "0.75rem",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 1030,
            backgroundColor: "#fff",
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
            marginLeft: "-0.5rem",
            marginRight: "-0.5rem",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem"
          }}
        >
          {isFullScreen && (
            <button
              type="button"
              className="text-primary text-decoration-none small border-0 bg-transparent p-0"
              onClick={() => navigate(-1)}
              style={{ cursor: "pointer" }}
            >
              ← Back to practice
            </button>
          )}
          <h1 className="h4 fw-bold text-dark mb-0 text-center">
            {paragraph.title}
          </h1>
          <div className="d-flex justify-content-end">
            <span
              className="badge bg-primary rounded-pill px-3 py-2 font-monospace"
              role="timer"
              aria-live="polite"
            >
              {formatTime(timerSeconds)}
            </span>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3 mb-3 p-3 rounded-3 bg-light">
          <label className="d-flex align-items-center gap-2 small mb-0">
            <input
              type="checkbox"
              checked={enableHighlight}
              onChange={(e) => setEnableHighlight(e.target.checked)}
              disabled={hasSubmitted}
              className="form-check-input"
            />
            <span>Enable Text Highlight</span>
          </label>
          <label className="d-flex align-items-center gap-2 small mb-0">
            <input
              type="checkbox"
              checked={enableBackspace}
              onChange={(e) => setEnableBackspace(e.target.checked)}
              disabled={hasSubmitted}
              className="form-check-input"
            />
            <span>Enable Backspace</span>
          </label>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Font size:</span>
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
                disabled={fontSizeIndex === 0 || hasSubmitted}
                aria-label="Decrease font size"
              >
                −
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled
                style={{ minWidth: "2.5rem" }}
              >
                {fontSize}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setFontSizeIndex((i) =>
                    Math.min(FONT_SIZES.length - 1, i + 1)
                  )
                }
                disabled={
                  fontSizeIndex === FONT_SIZES.length - 1 || hasSubmitted
                }
                aria-label="Increase font size"
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={toggleFullScreen}
            aria-pressed={isFullScreen}
          >
            {isFullScreen ? "Exit full screen" : "Full screen mode"}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleRestart}
          >
            Restart
          </button>
        </div>

        <div className="card border shadow-sm mb-3">
          <div className="card-body">
            <h2 className="h6 fw-semibold mb-2">Paragraph to type</h2>
            <div
              className="font-monospace overflow-auto rounded-3 p-4 mb-0"
              style={{
                whiteSpace: "pre-wrap",
                minHeight: "140px",
                maxHeight: "280px",
                backgroundColor: "#f8f9fa",
                fontSize: `${fontSize}px`,
                lineHeight: 1.6,
                color: "#1a1a1a"
              }}
            >
              {enableHighlight ? (
                <>
                  {chars.map((c, i) => {
                    const isPast = i < input.length;
                    const correct = isPast && input[i] === c;
                    const wrong = isPast && input[i] !== c;
                    return (
                      <span
                        key={i}
                        style={{
                          color: wrong
                            ? "#b02a37"
                            : correct
                              ? "#15803d"
                              : "#495057",
                          fontWeight: correct ? 600 : wrong ? 600 : 400
                        }}
                      >
                        {c === "\n" ? "\n" : c}
                      </span>
                    );
                  })}
                </>
              ) : (
                <span style={{ color: "#1a1a1a" }}>{text}</span>
              )}
            </div>
          </div>
        </div>

        <div className="card border shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h6 fw-semibold mb-0">Your typing</h2>
              {hasSubmitted && (
                <span className="badge bg-success">
                  Done · {formatTime(timerSeconds)}
                </span>
              )}
            </div>
            <textarea
              ref={textareaRef}
              className="form-control font-monospace"
              rows={8}
              placeholder="Start typing the paragraph above... Timer starts on first keystroke."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              disabled={hasSubmitted}
              autoFocus
              aria-label="Typing input"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
            />
          </div>
        </div>
        <div className="d-flex justify-content-center mt-4 mb-5 py-3">
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
    </main>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import blueProfileImage from "@/assets/blueProfileImage.png";
import { TestResultsModal } from "@/components/typing/TestResultsModal";
import { useAuthStore } from "@/stores/authStore";
import { submitTypingResult } from "@/features/paragraphs/paragraphsApi";
import type { ParagraphDetail } from "@/features/paragraphs/paragraphsApi";
import { computeTypingMetrics, type TypingMetrics } from "@/lib/typingMetrics";
import {
  getWordSegments,
  evaluateWords,
  type WordStatus
} from "@/lib/wordHighlighting";

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

const FONT_SIZES = [14, 16, 18, 20, 22] as const;
const DEFAULT_FONT_INDEX = 2;

const AUTO_SUBMIT_OPTIONS = [
  { value: 10 * 60, label: "10 minutes" },
  { value: 15 * 60, label: "15 minutes" },
  { value: 30 * 60, label: "30 minutes" },
  { value: 0, label: "Off" }
] as const;

type MPSCTypingUIProps = {
  paragraph: ParagraphDetail;
};

export function MPSCTypingUI({ paragraph }: MPSCTypingUIProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [enableHighlight, setEnableHighlight] = useState(false);
  const [enableBackspace, setEnableBackspace] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_INDEX);
  const [autoSubmitSeconds, setAutoSubmitSeconds] = useState(10 * 60);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsMetrics, setResultsMetrics] = useState<TypingMetrics | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
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
    const timeTaken =
      autoSubmitSeconds > 0 ? autoSubmitSeconds - currentTime : currentTime;
    const metrics = computeTypingMetrics(
      paragraph.text,
      currentInput,
      timeTaken,
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
  }, [
    hasSubmitted,
    autoSubmitSeconds,
    paragraph.text,
    paragraph._id,
    paragraph.language,
    queryClient
  ]);

  useEffect(() => {
    if (timerStarted && !hasSubmitted && autoSubmitSeconds > 0 && timerSeconds === 0) {
      setTimerSeconds(autoSubmitSeconds);
    }
  }, [timerStarted, hasSubmitted, autoSubmitSeconds, timerSeconds]);

  useEffect(() => {
    if (!timerStarted || hasSubmitted || autoSubmitTriggeredRef.current) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => {
        if (autoSubmitSeconds > 0) {
          const next = s - 1;
          if (next <= 0 && !autoSubmitTriggeredRef.current) {
            submitCurrentAttempt();
          }
          return Math.max(0, next);
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerStarted, hasSubmitted, autoSubmitSeconds, submitCurrentAttempt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (hasSubmitted) return;
    const raw = e.target.value;
    // MPSC: collapse multiple consecutive spaces to a single space
    const next = raw.replace(/  +/g, " ");
    const delta = next.length - input.length;
    if (delta > 0) setTotalKeystrokes((k) => k + delta);
    setInput(next);
    if (next.length > 0 && !timerStarted) setTimerStarted(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (hasSubmitted) return;
    // Disable directional keys and Home/End so cursor cannot be moved
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      e.preventDefault();
      return;
    }
    // MPSC: block Tab and Enter
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
      e.preventDefault();
      return;
    }
    // Prevent Space from replacing a selection (e.g. after Ctrl+A, space would wipe all text)
    const ta = e.currentTarget;
    if (e.key === " " && ta.selectionStart !== ta.selectionEnd) {
      e.preventDefault();
      return;
    }
    // MPSC: allow only one space at a time — block Space if there is already a space before the cursor
    if (e.key === " " && ta.selectionStart > 0 && input[ta.selectionStart - 1] === " ") {
      e.preventDefault();
      return;
    }
    // Prevent Backspace/Delete from removing a selection (only allow single-character delete)
    if (ta.selectionStart !== ta.selectionEnd && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      return;
    }
    if (!enableBackspace && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      return;
    }
    if (enableBackspace && e.key === "Backspace")
      setBackspaceCount((c) => c + 1);
  };

  const handleTextareaMouseDown = () => {
    if (hasSubmitted) return;
    // Keep cursor at end after click: run after the browser would have moved the cursor
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        const len = input.length;
        ta.setSelectionRange(len, len);
      }
    });
  };

  const handleCopyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
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
    autoSubmitTriggeredRef.current = false;
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (hasSubmitted || autoSubmitTriggeredRef.current) return;
    const timeTaken =
      autoSubmitSeconds > 0 ? autoSubmitSeconds - timerSeconds : timerSeconds;
    setHasSubmitted(true);
    const metrics = computeTypingMetrics(
      paragraph.text,
      input,
      timeTaken,
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

  useEffect(() => {
    currentCharRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [input]);

  const fontSize = FONT_SIZES[fontSizeIndex];
  const text = paragraph.text;
  const segments = getWordSegments(text);
  const evaluations = evaluateWords(text, input, { caseSensitive: true });
  const targetWordCount = text.trim().split(/\s+/).filter(Boolean).length;

  function getSegmentStatus(seg: { text: string; wordIndex: number; isWord: boolean }): WordStatus | "space" {
    if (!seg.isWord) return "space";
    const eval_ = evaluations[seg.wordIndex];
    return eval_?.status ?? "pending";
  }

  function getStatusStyles(status: WordStatus | "space"): React.CSSProperties {
    switch (status) {
      case "correct":
        return { color: "#15803d", fontWeight: 400 };
      case "incorrect":
        return { color: "#b02a37", fontWeight: 400 };
      case "omitted":
        return { color: "#000000", fontWeight: 400 };
      case "active":
        return { color: "#000000", fontWeight: 400 };
      case "pending":
      case "space":
      default:
        return { color: "#000000", fontWeight: 400 };
    }
  }

  let charOffset = 0;
  const segmentWithCursor = segments.find((seg) => {
    const start = charOffset;
    charOffset += seg.text.length;
    return input.length >= start && input.length < charOffset;
  });

  return (
    <main className="container py-4">
      <TestResultsModal
        open={resultsOpen}
        onOpenChange={setResultsOpen}
        metrics={resultsMetrics}
        paragraphId={paragraph._id}
        expectedText={paragraph.text}
        showTotalKeystrokes
        onRetry={handleRestart}
        onNext={() => navigate("/practice/mpsc")}
        portalContainer={isFullScreen ? fullscreenRef.current : undefined}
      />
      <div
        ref={fullscreenRef}
        className="typing-lesson-root"
        style={
          isFullScreen
            ? { minHeight: "100vh", maxHeight: "100vh", overflow: "auto", backgroundColor: "#fff", padding: "1rem" }
            : { backgroundColor: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }
        }
      >
        <div
          className="mb-3"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
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
          <div className="d-flex justify-content-start">
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
          </div>
          <h1 className="h4 fw-bold text-dark mb-0 text-center" style={{ justifySelf: "center" }}>
            {paragraph.title}
          </h1>
          <div className="d-flex justify-content-end">
            <span
              className="d-inline-flex align-items-center gap-2 rounded-3 px-3 py-2 font-monospace"
              role="timer"
              aria-live="polite"
              style={{ backgroundColor: "#fae8e8", color: "#ff3131" }}
            >
              <ClockIcon />
              {formatTime(timerSeconds)}
            </span>
          </div>
        </div>

        <div
          className="d-flex gap-3 mb-3 flex-grow-1"
          style={{ alignItems: "stretch", minHeight: 0 }}
        >
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="card border shadow-sm mb-3 lesson-typing-card">
          <div className="card-body">
            <h2 className="h6 fw-semibold mb-2">Paragraph to type</h2>
            <div
              className="overflow-auto rounded-3 p-4 mb-0"
              style={{
                whiteSpace: "pre-wrap",
                minHeight: "140px",
                maxHeight: "280px",
                backgroundColor: "#f8f9fa",
                fontSize: `${fontSize}px`,
                lineHeight: 1.6,
                color: "#000000"
              }}
              onCopy={(e) => e.preventDefault()}
            >
              {enableHighlight ? (
                <>
                  {segments.map((seg, segIdx) => {
                    const status = getSegmentStatus(seg);
                    const isCurrentSegment = seg === segmentWithCursor;
                    return (
                      <span
                        key={segIdx}
                        ref={isCurrentSegment ? currentCharRef : undefined}
                        style={getStatusStyles(status)}
                      >
                        {seg.text}
                      </span>
                    );
                  })}
                  {evaluations.slice(targetWordCount).map((eval_, idx) => (
                    <span
                      key={`extra-${idx}`}
                      style={getStatusStyles("incorrect")}
                    >
                      {" "}{eval_.text}
                    </span>
                  ))}
                </>
              ) : (
                <span style={{ color: "#000000" }}>{text}</span>
              )}
            </div>
          </div>
        </div>

            <div className="card border shadow-sm lesson-typing-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="h6 fw-semibold mb-0">Your typing</h2>
                  {hasSubmitted && resultsMetrics && (
                    <span className="badge bg-success">
                      Done · {formatTime(resultsMetrics.timeTakenSeconds)}
                    </span>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  className="form-control"
                  rows={8}
                  placeholder="Start your practice here..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onMouseDown={handleTextareaMouseDown}
                  onCopy={handleCopyPaste}
                  onCopyCapture={(e) => e.preventDefault()}
                  onPaste={handleCopyPaste}
                  onCut={handleCopyPaste}
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

          <aside
            className="rounded-3 rounded-end-0 p-3 flex-shrink-0 d-flex flex-column gap-3"
            style={{
              width: "240px",
              backgroundColor: "#15803d",
              color: "#fff",
              marginRight: "calc(-1 * var(--bs-gutter-x, 0.75rem))",
              alignSelf: "stretch"
            }}
          >
            <div className="text-center">
              <img
                src={blueProfileImage}
                alt=""
                className="rounded-circle mb-2"
                width={56}
                height={56}
                style={{ objectFit: "cover" }}
              />
              <div className="small fw-semibold">
                {user?.name ? `Hello, ${user.name}` : "Hello, Guest User"}
              </div>
            </div>
            <label className="d-flex align-items-center gap-2 small mb-0 text-white">
              <input
                type="checkbox"
                checked={enableHighlight}
                onChange={(e) => setEnableHighlight(e.target.checked)}
                disabled={hasSubmitted}
                className="form-check-input"
              />
              <span>Enable Highlight</span>
            </label>
            <label className="d-flex align-items-center gap-2 small mb-0 text-white">
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
              <label className="small mb-0 text-white">Auto submit:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: "auto", flex: 1 }}
                value={autoSubmitSeconds}
                onChange={(e) => setAutoSubmitSeconds(Number(e.target.value))}
                disabled={hasSubmitted || timerStarted}
              >
                {AUTO_SUBMIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-white">Font size:</span>
              <div
                className="btn-group btn-group-sm"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #000"
                }}
              >
                <button
                  type="button"
                  className="btn btn-sm bg-white text-dark"
                  style={{ borderColor: "rgba(0, 0, 0, 0.89)" }}
                  onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
                  disabled={fontSizeIndex === 0 || hasSubmitted}
                  aria-label="Decrease font size"
                >
                  −
                </button>
                <button
                  type="button"
                  className="btn btn-sm bg-white text-dark"
                  disabled
                  style={{
                    minWidth: "2rem",
                    fontSize: "0.875rem",
                    borderColor: "rgba(0, 0, 0, 0.89)"
                  }}
                >
                  {fontSize}
                </button>
                <button
                  type="button"
                  className="btn btn-sm bg-white text-dark"
                  style={{ borderColor: "rgba(0, 0, 0, 0.89)" }}
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
              className="btn btn-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={toggleFullScreen}
              aria-pressed={isFullScreen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
              </svg>
              {isFullScreen ? "Exit full screen" : "Full screen mode"}
            </button>
            <button
              type="button"
              className="btn btn-light btn-sm w-100"
              onClick={handleRestart}
            >
              Restart
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

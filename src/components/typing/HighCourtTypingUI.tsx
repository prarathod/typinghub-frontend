import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { TestResultsModal } from "@/components/typing/TestResultsModal";
import { getCurrentUser } from "@/features/auth/authApi";
import { submitTypingResult } from "@/features/paragraphs/paragraphsApi";
import type { ParagraphDetail } from "@/features/paragraphs/paragraphsApi";
import { isPaidParagraph } from "@/lib/access";
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

type HighCourtTypingUIProps = {
  paragraph: ParagraphDetail;
};

/**
 * "Latest High Court" typing screen: MPSC-style visible split layout
 * (paragraph left, typing right) combined with Court Exam's exact
 * keystroke rules (see CourtTypingUI.tsx, which this logic mirrors).
 */
export function HighCourtTypingUI({ paragraph }: HighCourtTypingUIProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [enableBackspace, setEnableBackspace] = useState(false);
  const [autoSubmitSeconds, setAutoSubmitSeconds] = useState(10 * 60);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsMetrics, setResultsMetrics] = useState<TypingMetrics | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const paragraphScrollRef = useRef<HTMLDivElement>(null);
  const autoSubmitTriggeredRef = useRef(false);
  const inputRef = useRef(input);
  const totalKeystrokesRef = useRef(totalKeystrokes);
  const backspaceCountRef = useRef(backspaceCount);
  const timerSecondsRef = useRef(timerSeconds);
  const autoSubmitSecondsRef = useRef(autoSubmitSeconds);

  useEffect(() => {
    if (!resultsOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Tab") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [resultsOpen]);

  // Disable mouse wheel scroll on paragraph area; user can only scroll via scrollbar.
  useEffect(() => {
    const el = paragraphScrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      const wouldScrollDown = e.deltaY > 0 && scrollTop < maxScroll;
      const wouldScrollUp = e.deltaY < 0 && scrollTop > 0;
      if (wouldScrollDown || wouldScrollUp) e.preventDefault();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  useEffect(() => {
    inputRef.current = input;
    totalKeystrokesRef.current = totalKeystrokes;
    backspaceCountRef.current = backspaceCount;
    timerSecondsRef.current = timerSeconds;
    autoSubmitSecondsRef.current = autoSubmitSeconds;
  }, [input, totalKeystrokes, backspaceCount, timerSeconds, autoSubmitSeconds]);

  const submitCurrentAttempt = useCallback(async (autoSubmitTimeTaken?: number) => {
    if (hasSubmitted || autoSubmitTriggeredRef.current) return;
    if (isPaidParagraph(paragraph)) {
      try {
        await getCurrentUser();
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate("/");
          return;
        }
        throw err;
      }
    }
    autoSubmitTriggeredRef.current = true;
    setHasSubmitted(true);
    setTimerStarted(false);
    const currentInput = inputRef.current;
    const currentKeystrokes = totalKeystrokesRef.current;
    const currentBackspace = backspaceCountRef.current;
    const timerVal = timerSecondsRef.current;
    const autoSubmitVal = autoSubmitSecondsRef.current;
    const currentTime =
      autoSubmitTimeTaken != null
        ? autoSubmitTimeTaken
        : autoSubmitVal > 0
          ? Math.max(0, autoSubmitVal - timerVal)
          : timerVal;
    const passageText = paragraph.text;
    const hasLeadingWs = /^\s+/.test(passageText);
    const passageForMetrics = hasLeadingWs
      ? "__LEADING_WS__ " + passageText.trimStart()
      : passageText;
    const userForMetrics =
      hasLeadingWs && /^\s+/.test(currentInput)
        ? "__LEADING_WS__ " + currentInput.trimStart()
        : currentInput;
    // Replace newlines with a special token so Enter position is checked:
    // correct Enter → __NEWLINE__ matches __NEWLINE__; wrong/missing → counted as error.
    const passageWithNewlines = passageForMetrics.replace(/\n/g, " __NEWLINE__ ");
    const userWithNewlines = userForMetrics.replace(/\n/g, " __NEWLINE__ ");
    const metrics = computeTypingMetrics(
      passageWithNewlines,
      userWithNewlines,
      currentTime,
      currentKeystrokes,
      currentBackspace,
      paragraph.language
    );
    const metricsToUse = { ...metrics, userInput: currentInput };
    if (hasLeadingWs && !/^\s+/.test(currentInput)) {
      metricsToUse.accuracy = Math.round(
        (metricsToUse.correctWordsCount / (metricsToUse.wordsTyped + 1)) * 100
      );
      metricsToUse.omittedWords = metricsToUse.omittedWords.map((w) =>
        w === "__LEADING_WS__" ? "(leading tab)" : w
      );
    }
    const replaceNewlineToken = (w: string) => w === "__NEWLINE__" ? "↵ (Enter)" : w;
    metricsToUse.incorrectWords = metricsToUse.incorrectWords.map(replaceNewlineToken);
    metricsToUse.misspelledWords = metricsToUse.misspelledWords.map(replaceNewlineToken);
    metricsToUse.extraWords = metricsToUse.extraWords.map(replaceNewlineToken);
    metricsToUse.omittedWords = metricsToUse.omittedWords.map(replaceNewlineToken);
    setResultsMetrics(metricsToUse);
    setResultsOpen(true);
    try {
      const totalPassageWords =
        metricsToUse.correctWordsCount +
        metricsToUse.incorrectWordsCount +
        metricsToUse.omittedWordsCount;
      await submitTypingResult(paragraph._id, {
        timeTakenSeconds: metricsToUse.timeTakenSeconds,
        accuracy: metricsToUse.accuracy,
        totalKeystrokes: metricsToUse.totalKeystrokes,
        backspaceCount: metricsToUse.backspaceCount,
        wordsTyped: metricsToUse.wordsTyped,
        wpm: metricsToUse.wpm,
        kpm: metricsToUse.kpm,
        incorrectWordsCount: metricsToUse.incorrectWordsCount,
        incorrectWords: metricsToUse.incorrectWords,
        correctWordsCount: metricsToUse.correctWordsCount,
        userInput: metricsToUse.userInput,
        omittedWordsCount: metricsToUse.omittedWordsCount,
        totalPassageWords
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leaderboard", paragraph._id] }),
        queryClient.invalidateQueries({ queryKey: ["history", paragraph._id] }),
        queryClient.invalidateQueries({ queryKey: ["paragraphs"] })
      ]);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setResultsOpen(false);
        navigate("/");
      }
      console.error("Failed to store submission:", err);
    }
  }, [hasSubmitted, paragraph, paragraph.text, paragraph._id, paragraph.language, queryClient, navigate]);

  // No separate "Start" step: initialize the countdown the moment the user starts typing.
  useEffect(() => {
    if (timerStarted && !hasSubmitted && autoSubmitSeconds > 0 && timerSeconds === 0) {
      setTimerSeconds(autoSubmitSeconds);
    }
  }, [timerStarted, hasSubmitted, autoSubmitSeconds, timerSeconds]);

  useEffect(() => {
    if (!timerStarted || hasSubmitted || autoSubmitTriggeredRef.current) return;
    const id = setInterval(() => {
      if (autoSubmitSeconds > 0) {
        setTimerSeconds((s) => {
          const next = s - 1;
          if (next <= 0 && !autoSubmitTriggeredRef.current) {
            submitCurrentAttempt(autoSubmitSecondsRef.current);
          }
          return Math.max(0, next);
        });
      } else {
        setTimerSeconds((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [timerStarted, hasSubmitted, autoSubmitSeconds, submitCurrentAttempt]);

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
    // Disable Ctrl+A / Cmd+A (select all)
    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault();
      return;
    }
    // Prevent Space from replacing a selection (e.g. after Ctrl+A, space would wipe all text)
    const ta = e.currentTarget;
    if (e.key === " " && ta.selectionStart !== ta.selectionEnd) {
      e.preventDefault();
      return;
    }
    // Prevent Backspace/Delete from removing a selection (only allow single-character delete)
    if (ta.selectionStart !== ta.selectionEnd && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      return;
    }
    // Disable Delete; conditionally disable Backspace
    if (e.key === "Delete") {
      e.preventDefault();
      return;
    }
    if (e.key === "Backspace") {
      if (!enableBackspace) {
        e.preventDefault();
        setBackspaceCount((c) => c + 1);
        return;
      }
      setBackspaceCount((c) => c + 1);
      return;
    }
    // Allow Tab; insert 4 spaces in textarea instead of moving focus
    if (e.key === "Tab") {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const tabSpaces = "    ";
      const next = input.slice(0, start) + tabSpaces + input.slice(end);
      setInput(next);
      setTotalKeystrokes((k) => k + 4);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + tabSpaces.length;
      }, 0);
      return;
    }
  };

  const handleSubmit = async () => {
    if (hasSubmitted || autoSubmitTriggeredRef.current) return;
    await submitCurrentAttempt();
  };

  const handleRestart = () => {
    setInput("");
    setTimerSeconds(autoSubmitSeconds > 0 ? autoSubmitSeconds : 0);
    setTimerStarted(false);
    setHasSubmitted(false);
    setTotalKeystrokes(0);
    setBackspaceCount(0);
    setResultsOpen(false);
    setResultsMetrics(null);
    autoSubmitTriggeredRef.current = false;
    textareaRef.current?.focus();
  };

  return (
    <main className="container py-4" style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <TestResultsModal
        open={resultsOpen}
        onOpenChange={setResultsOpen}
        metrics={resultsMetrics}
        paragraphId={paragraph._id}
        expectedText={paragraph.text}
        onRetry={handleRestart}
        onNext={() => navigate((location.state as { backUrl?: string } | null)?.backUrl ?? "/practice/high-court")}
        checkNewlines
      />

      <div
        className="court-active-header mb-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "0.75rem",
          alignItems: "center"
        }}
      >
        <div className="court-header-left d-flex align-items-center gap-2 flex-wrap">
          <label className="d-flex align-items-center gap-2 small mb-0">
            <input
              type="checkbox"
              checked={showTimer}
              onChange={(e) => setShowTimer(e.target.checked)}
              className="form-check-input"
            />
            <span>Show timer</span>
          </label>
          <label className="d-flex align-items-center gap-2 small mb-0">
            <input
              type="checkbox"
              checked={enableBackspace}
              onChange={(e) => setEnableBackspace(e.target.checked)}
              className="form-check-input"
            />
            <span>Enable Backspace</span>
          </label>
          <div className="d-flex align-items-center gap-2">
            <label className="small mb-0">Auto submit:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
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
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleRestart}
          >
            Restart
          </button>
        </div>
        <h1 className="court-header-title h4 fw-bold text-dark mb-0 text-center">
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

      <div className="d-flex flex-column flex-md-row gap-3 mb-3">
        <div className="flex-fill" style={{ minWidth: 0 }}>
          <div className="card border shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 fw-semibold mb-2">Paragraph to type</h2>
              <div
                ref={paragraphScrollRef}
                className="overflow-auto rounded-3 p-4 mb-0"
                style={{
                  whiteSpace: "pre-wrap",
                  minHeight: "260px",
                  maxHeight: "420px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "18px",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  color: "#1a1a1a",
                  textAlign: "justify"
                }}
              >
                {paragraph.text}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-fill" style={{ minWidth: 0 }}>
          <div className="card border shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="h6 fw-semibold mb-0">Your typing</h2>
                {hasSubmitted && (
                  <span className="badge bg-success">Done</span>
                )}
              </div>
              <textarea
                ref={textareaRef}
                className="form-control"
                rows={12}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                spellCheck={false}
                disabled={hasSubmitted}
                autoFocus
                aria-label="Typing input"
                style={{ fontSize: "18px", lineHeight: 1.6, resize: "none" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mb-3">
        <button
          type="button"
          className="btn btn-primary btn-lg px-5"
          onClick={handleSubmit}
          disabled={hasSubmitted}
        >
          Submit
        </button>
      </div>
    </main>
  );
}

/**
 * Typing test metrics and error counting.
 * Uses word-level alignment to detect correct, incorrect, and omitted words.
 * Omitted = target word was skipped (no chain reaction for following words).
 */

import { alignWords, splitWords } from "./wordHighlighting";

export type TypingMetrics = {
  timeTakenSeconds: number;
  accuracy: number;
  totalKeystrokes: number;
  backspaceCount: number;
  wordsTyped: number;
  wpm: number;
  kpm: number;
  incorrectWordsCount: number;
  incorrectWords: string[];
  omittedWordsCount: number;
  omittedWords: string[];
  correctWordsCount: number;
  userInput: string;
};

export function computeTypingMetrics(
  passage: string,
  userInput: string,
  timeTakenSeconds: number,
  totalKeystrokes: number,
  backspaceCount: number,
  _language: "english" | "marathi"
): TypingMetrics {
  const passageWords = splitWords(passage);
  const userWords = splitWords(userInput.trim());
  const caseSensitive = false;
  const aligned = alignWords(passageWords, userWords, { caseSensitive });

  let correctWordsCount = 0;
  const incorrectWords: string[] = [];
  const omittedWords: string[] = [];

  for (const a of aligned) {
    switch (a.status) {
      case "correct":
        correctWordsCount++;
        break;
      case "incorrect":
        incorrectWords.push(a.typedWord ?? a.text);
        break;
      case "omitted":
        omittedWords.push(a.text);
        break;
    }
  }

  const totalWords = passageWords.length;
  const incorrectWordsCount = incorrectWords.length;
  const omittedWordsCount = omittedWords.length;
  const wordsTyped = userWords.length;
  const safeSeconds = Math.max(1, timeTakenSeconds);
  const timeMinutes = safeSeconds / 60;
  const accuracy =
    wordsTyped === 0 ? 100 : Math.round((correctWordsCount / wordsTyped) * 100);
  const wpm = Math.round(correctWordsCount / timeMinutes);
  const kpm = Math.round(totalKeystrokes / timeMinutes);

  return {
    timeTakenSeconds,
    accuracy,
    totalKeystrokes,
    backspaceCount,
    wordsTyped,
    wpm,
    kpm,
    incorrectWordsCount,
    incorrectWords,
    omittedWordsCount,
    omittedWords,
    correctWordsCount,
    userInput
  };
}

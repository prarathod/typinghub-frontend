/**
 * Typing test metrics and error counting.
 * Uses word-level alignment to detect correct, incorrect, and omitted words.
 * Omitted = target word was skipped (no chain reaction for following words).
 */

import { alignWords, splitWords } from "./wordHighlighting";

export type WordPair = { correct: string; typed: string };

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
  incorrectWordPairs: WordPair[];
  misspelledWordsCount: number;
  misspelledWords: string[];
  misspelledWordPairs: WordPair[];
  extraWordsCount: number;
  extraWords: string[];
  omittedWordsCount: number;
  omittedWords: string[];
  correctWordsCount: number;
  userInput: string;
};

export function computeTypingMetrics(
  passage: string,
  userInput: string,
  timeTakenSeconds: number,
  _totalKeystrokes: number,
  backspaceCount: number,
  _language: "english" | "marathi"
): TypingMetrics {
  const passageWords = splitWords(passage);
  const userWords = splitWords(userInput.trim());
  const caseSensitive = true;
  const aligned = alignWords(passageWords, userWords, { caseSensitive });

  let correctWordsCount = 0;
  const incorrectWords: string[] = [];
  const incorrectWordPairs: WordPair[] = [];
  const misspelledWords: string[] = [];
  const misspelledWordPairs: WordPair[] = [];
  const extraWords: string[] = [];
  const omittedWords: string[] = [];

  for (const a of aligned) {
    switch (a.status) {
      case "correct":
        correctWordsCount++;
        break;
      case "incorrect":
        incorrectWords.push(a.typedWord ?? a.text);
        incorrectWordPairs.push({ correct: a.text, typed: a.typedWord ?? a.text });
        break;
      case "misspelled":
        misspelledWords.push(a.typedWord ?? a.text);
        misspelledWordPairs.push({ correct: a.text, typed: a.typedWord ?? a.text });
        break;
      case "extra":
        extraWords.push(a.typedWord ?? a.text);
        break;
      case "omitted":
        omittedWords.push(a.text);
        break;
    }
  }

  const incorrectWordsCount = incorrectWords.length;
  const misspelledWordsCount = misspelledWords.length;
  const extraWordsCount = extraWords.length;
  const omittedWordsCount = omittedWords.length;
  const wordsTyped = userWords.length;
  const safeSeconds = Math.max(1, timeTakenSeconds);
  const timeMinutes = safeSeconds / 60;
  const accuracy =
    wordsTyped === 0 ? 100 : Math.round((correctWordsCount / wordsTyped) * 100);
  const wpm = Math.round(correctWordsCount / timeMinutes);
  const totalKeystrokesAsChars = userInput.length;
  const kpm = Math.round(totalKeystrokesAsChars / timeMinutes);

  return {
    timeTakenSeconds,
    accuracy,
    totalKeystrokes: totalKeystrokesAsChars,
    backspaceCount,
    wordsTyped,
    wpm,
    kpm,
    incorrectWordsCount,
    incorrectWords,
    incorrectWordPairs,
    misspelledWordsCount,
    misspelledWords,
    misspelledWordPairs,
    extraWordsCount,
    extraWords,
    omittedWordsCount,
    omittedWords,
    correctWordsCount,
    userInput
  };
}

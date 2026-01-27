/**
 * Typing test metrics and error counting.
 * Rules: word omitted, substitution, extra word, spelling (repetition/inclusion/
 * alteration/omission of letters), incorrect capitalization (English) = 1 error each.
 */

function splitWords(s: string): string[] {
  return s.split(/\s+/).filter(Boolean);
}

function isCapitalizationError(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase() && a !== b;
}

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
  correctWordsCount: number;
  userInput: string;
};

export function computeTypingMetrics(
  passage: string,
  userInput: string,
  timeTakenSeconds: number,
  totalKeystrokes: number,
  backspaceCount: number,
  language: "english" | "marathi"
): TypingMetrics {
  const passageWords = splitWords(passage);
  const userWords = splitWords(userInput);
  let correctWordsCount = 0;
  const incorrectWords: string[] = [];
  const totalWords = passageWords.length;
  const safeSeconds = Math.max(1, timeTakenSeconds);
  const timeMinutes = safeSeconds / 60;

  for (let i = 0; i < Math.max(passageWords.length, userWords.length); i++) {
    const pw = passageWords[i];
    const uw = userWords[i];

    if (!pw) {
      incorrectWords.push(uw ?? "");
      continue;
    }
    if (!uw) {
      incorrectWords.push(`[omitted: ${pw}]`);
      continue;
    }

    if (pw === uw) {
      correctWordsCount++;
    } else if (language === "english" && isCapitalizationError(pw, uw)) {
      incorrectWords.push(uw);
    } else {
      incorrectWords.push(uw);
    }
  }

  const incorrectWordsCount = incorrectWords.length;
  const wordsTyped = userWords.length;
  const accuracy =
    totalWords === 0 ? 100 : Math.round((correctWordsCount / totalWords) * 100);
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
    correctWordsCount,
    userInput
  };
}

/**
 * Word-by-word evaluation for real-time typing test.
 * Words are evaluated only when completed (space pressed).
 * Status: pending (not typed), active (currently typing), correct, incorrect.
 */

export type WordStatus = "pending" | "active" | "correct" | "incorrect";

export type WordSegment = {
  text: string;
  wordIndex: number;
  isWord: boolean;
};

export type WordEvaluation = {
  text: string;
  status: WordStatus;
  wordIndex: number;
};

/**
 * Splits a string into segments (words and spaces) preserving original structure.
 * e.g. "hello  my\nname" -> [{text:"hello", isWord:true}, {text:"  \n", isWord:false}, ...]
 */
export function getWordSegments(target: string): WordSegment[] {
  const segments: WordSegment[] = [];
  const regex = /\S+|\s+/g;
  let match;
  let wordIndex = 0;
  while ((match = regex.exec(target)) !== null) {
    const text = match[0];
    const isWord = /\S/.test(text);
    segments.push({
      text,
      wordIndex: isWord ? wordIndex++ : -1,
      isWord
    });
  }
  return segments;
}

/**
 * Splits into words using spaces as separators. Collapses multiple spaces.
 */
function splitWords(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

/**
 * Evaluates target vs input word-by-word.
 * - pending: word not yet reached
 * - active: currently typing (last word, no trailing space)
 * - correct/incorrect: completed word matches or not
 * Handles: extra spaces, backspace, extra words, case sensitivity.
 */
export function evaluateWords(
  target: string,
  input: string,
  options?: { caseSensitive?: boolean }
): WordEvaluation[] {
  const caseSensitive = options?.caseSensitive ?? false;
  const targetWords = splitWords(target);
  const inputTrimmed = input.trimEnd();
  const inputEndsWithSpace = input.length > 0 && /\s$/.test(input);
  const inputWords = splitWords(inputTrimmed);

  const result: WordEvaluation[] = [];

  for (let i = 0; i < targetWords.length; i++) {
    const tw = targetWords[i];
    const uw = inputWords[i];

    let status: WordStatus;
    if (uw === undefined) {
      status = "pending";
    } else if (i === inputWords.length - 1 && !inputEndsWithSpace) {
      status = "active";
    } else {
      const match = caseSensitive
        ? tw === uw
        : tw.toLowerCase() === uw.toLowerCase();
      status = match ? "correct" : "incorrect";
    }

    result.push({ text: tw, status, wordIndex: i });
  }

  // Extra words beyond target
  for (let i = targetWords.length; i < inputWords.length; i++) {
    result.push({
      text: inputWords[i],
      status: "incorrect",
      wordIndex: i
    });
  }

  return result;
}

/**
 * Maps word evaluations to segments for display.
 * Each segment gets the status of its word (or neutral for spaces).
 */
export function getSegmentsWithStatus(
  target: string,
  input: string,
  options?: { caseSensitive?: boolean }
): Array<{ text: string; status: WordStatus | "space"; wordIndex: number }> {
  const segments = getWordSegments(target);
  const evaluations = evaluateWords(target, input, options);

  return segments.map((seg) => {
    if (!seg.isWord) {
      return { text: seg.text, status: "space" as const, wordIndex: seg.wordIndex };
    }
    const eval_ = evaluations[seg.wordIndex];
    return {
      text: seg.text,
      status: eval_?.status ?? "pending",
      wordIndex: seg.wordIndex
    };
  });
}

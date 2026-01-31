/**
 * Word-by-word evaluation for real-time typing test.
 * Words are evaluated only when completed (space pressed).
 * Status: pending (not typed), active (currently typing), correct, incorrect, omitted.
 * Omitted = target word was skipped (user typed a different word that matches a later target).
 */

export type WordStatus = "pending" | "active" | "correct" | "incorrect" | "omitted";

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
export function splitWords(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

function wordsMatch(a: string, b: string, caseSensitive: boolean): boolean {
  return caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase();
}

/**
 * Aligns target words with typed words using sequential matching.
 * Detects omitted words (skipped) vs incorrect (wrong substitution).
 * If typed word matches a later target, intervening targets are omitted.
 */
export function alignWords(
  targetWords: string[],
  typedWords: string[],
  options?: { caseSensitive?: boolean }
): Array<{ text: string; status: "correct" | "incorrect" | "omitted"; wordIndex: number }> {
  const caseSensitive = options?.caseSensitive ?? false;
  const result: Array<{ text: string; status: "correct" | "incorrect" | "omitted"; wordIndex: number }> = [];
  let ti = 0;
  let ty = 0;

  while (ti < targetWords.length) {
    const tw = targetWords[ti];
    if (ty >= typedWords.length) {
      result.push({ text: tw, status: "omitted", wordIndex: ti });
      ti++;
      continue;
    }
    const uw = typedWords[ty];
    if (wordsMatch(tw, uw, caseSensitive)) {
      result.push({ text: tw, status: "correct", wordIndex: ti });
      ti++;
      ty++;
      continue;
    }
    const found = targetWords.findIndex(
      (w, j) => j > ti && wordsMatch(w, uw, caseSensitive)
    );
    if (found >= 0) {
      for (let k = ti; k < found; k++) {
        result.push({ text: targetWords[k], status: "omitted", wordIndex: k });
      }
      result.push({ text: targetWords[found], status: "correct", wordIndex: found });
      ti = found + 1;
      ty++;
    } else {
      result.push({ text: tw, status: "incorrect", wordIndex: ti });
      ti++;
      ty++;
    }
  }

  return result;
}

/**
 * Evaluates target vs input word-by-word.
 * - pending: word not yet reached
 * - active: currently typing (last word, no trailing space)
 * - correct/incorrect/omitted: from alignment of completed words
 * Handles: extra spaces, backspace, extra words, omitted words, case sensitivity.
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

  const completedTypedWords = inputEndsWithSpace
    ? inputWords
    : inputWords.slice(0, -1);
  const activeTargetIndex =
    !inputEndsWithSpace && inputWords.length > 0
      ? Math.min(inputWords.length - 1, targetWords.length - 1)
      : -1;

  const aligned =
    completedTypedWords.length > 0
      ? alignWords(targetWords, completedTypedWords, { caseSensitive })
      : [];
  const alignedByIndex = new Map(aligned.map((a) => [a.wordIndex, a]));

  const result: WordEvaluation[] = [];
  for (let i = 0; i < targetWords.length; i++) {
    const a = alignedByIndex.get(i);
    let status: WordStatus;
    if (i === activeTargetIndex) {
      status = "active";
    } else if (a) {
      status = a.status;
    } else if (
      completedTypedWords.length > 0 &&
      i >= completedTypedWords.length &&
      i > activeTargetIndex
    ) {
      status = "omitted";
    } else {
      status = "pending";
    }
    result.push({
      text: targetWords[i],
      status,
      wordIndex: i
    });
  }

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

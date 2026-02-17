/**
 * Word-by-word evaluation for real-time typing test.
 * Words are evaluated only when completed (space pressed).
 * 
 * Core Algorithm: Greedy Forward Matching
 * - Space commits a word
 * - Uses Levenshtein edit distance for misspelling detection
 * - Threshold = ceil(max(typed.length, source.length) / 2)
 */

export type WordStatus = "pending" | "active" | "correct" | "incorrect" | "omitted" | "misspelled" | "extra";

export type WordSegment = {
  text: string;
  wordIndex: number;
  isWord: boolean;
};

export type WordEvaluation = {
  text: string;
  status: WordStatus;
  wordIndex: number;
  typedWord?: string;
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
 * Calculates Levenshtein edit distance between two strings.
 * Standard dynamic programming implementation.
 */
function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= aLen; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= bLen; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[aLen][bLen];
}

/**
 * Result type for aligned words
 */
type AlignedWord = {
  text: string;
  status: "correct" | "incorrect" | "omitted" | "misspelled" | "extra";
  wordIndex: number;
  typedWord?: string;
  isSkipped?: boolean;
};

/**
 * Aligns target words with typed words using greedy forward matching.
 * 
 * Algorithm:
 * 1. Initialize sourcePtr = 0
 * 2. For each typed word:
 *    a. Exact match scan: scan forward from sourcePtr looking for exact match
 *       - If found at j: mark sourceWords[sourcePtr..j-1] as OMITTED, sourceWords[j] as CORRECT
 *    b. Misspelling check (if step a failed): compare using Levenshtein distance
 *       - Threshold = ceil(max(typed.length, source.length) / 2)
 *       - If 0 < distance <= threshold: mark as MISSPELLED
 *    c. Extra word (if steps a & b failed): mark typed word as EXTRA
 *       - sourcePtr stays the same
 * 3. After all typed words: remaining source words are unprocessed (OMITTED on finish)
 */
export function alignWords(
  targetWords: string[],
  typedWords: string[],
  options?: { caseSensitive?: boolean }
): AlignedWord[] {
  const caseSensitive = options?.caseSensitive ?? true;
  const result: AlignedWord[] = [];
  let sourcePtr = 0;

  for (let ty = 0; ty < typedWords.length; ty++) {
    const typed = typedWords[ty];
    
    // Step 1: Exact match scan - forward from sourcePtr
    let foundIndex = -1;
    for (let j = sourcePtr; j < targetWords.length; j++) {
      if (wordsMatch(targetWords[j], typed, caseSensitive)) {
        foundIndex = j;
        break;
      }
    }

    if (foundIndex >= 0) {
      // Found exact match - mark skipped words as OMITTED
      for (let k = sourcePtr; k < foundIndex; k++) {
        result.push({ text: targetWords[k], status: "omitted", wordIndex: k, isSkipped: true });
      }
      // Mark the matched word as CORRECT
      result.push({ text: targetWords[foundIndex], status: "correct", wordIndex: foundIndex });
      sourcePtr = foundIndex + 1;
      continue;
    }

    // Step 2: Misspelling check - compare against sourceWords[sourcePtr]
    if (sourcePtr < targetWords.length) {
      const source = targetWords[sourcePtr];
      const maxLen = Math.max(typed.length, source.length);
      const threshold = Math.ceil(maxLen / 2);
      
      // Use case-insensitive comparison for misspelling detection
      const dist = levenshteinDistance(
        caseSensitive ? typed : typed.toLowerCase(),
        caseSensitive ? source : source.toLowerCase()
      );
      
      if (dist > 0 && dist <= threshold) {
        // Mark as misspelled
        result.push({ text: source, status: "misspelled", wordIndex: sourcePtr, typedWord: typed });
        sourcePtr++;
        continue;
      }
    }

    // Step 3: Extra word - no match found, mark as EXTRA
    result.push({ text: typed, status: "extra", wordIndex: targetWords.length + ty, typedWord: typed });
    // sourcePtr stays the same
  }

  // Mark remaining unprocessed source words as OMITTED (not skipped, just untyped)
  for (let k = sourcePtr; k < targetWords.length; k++) {
    result.push({ text: targetWords[k], status: "omitted", wordIndex: k, isSkipped: false });
  }

  return result;
}

/**
 * Evaluates target vs input word-by-word for real-time display.
 * - pending: word not yet reached
 * - active: currently typing (last word, no trailing space)
 * - correct/incorrect/omitted/misspelled/extra: from alignment
 */
export function evaluateWords(
  target: string,
  input: string,
  options?: { caseSensitive?: boolean }
): WordEvaluation[] {
  const caseSensitive = options?.caseSensitive ?? true;
  const targetWords = splitWords(target);
  const inputTrimmed = input.trimEnd();
  const inputEndsWithSpace = input.length > 0 && /\s$/.test(input);
  const inputWords = splitWords(inputTrimmed);

  // Only evaluate completed words (ended with space)
  const completedTypedWords = inputEndsWithSpace
    ? inputWords
    : inputWords.slice(0, -1);
    
  const aligned =
    completedTypedWords.length > 0
      ? alignWords(targetWords, completedTypedWords, { caseSensitive })
      : [];
      
  const alignedByIndex = new Map(aligned.map((a) => [a.wordIndex, a]));

  // Active = the target word we're currently typing
  // Find the last processed source word index
  let lastProcessedIndex = -1;
  for (const a of aligned) {
    if (a.wordIndex < targetWords.length) {
      lastProcessedIndex = Math.max(lastProcessedIndex, a.wordIndex);
    }
  }
  
  const activeTargetIndex =
    !inputEndsWithSpace && inputWords.length > 0
      ? Math.min(lastProcessedIndex + 1, targetWords.length - 1)
      : -1;

  const result: WordEvaluation[] = [];
  for (let i = 0; i < targetWords.length; i++) {
    const a = alignedByIndex.get(i);
    let status: WordStatus;
    
    if (i === activeTargetIndex) {
      status = "active";
    } else if (a) {
      // If word is marked as omitted but not skipped, it's untyped (pending)
      if (a.status === "omitted" && !a.isSkipped) {
        status = "pending";
      } else {
        status = a.status;
      }
    } else if (lastProcessedIndex >= 0 && i > lastProcessedIndex) {
      status = "pending";
    } else {
      status = "pending";
    }
    
    result.push({
      text: targetWords[i],
      status,
      wordIndex: i,
      typedWord: a?.typedWord
    });
  }

  // Add extra words (typed beyond target)
  for (let i = targetWords.length; i < inputWords.length; i++) {
    result.push({
      text: inputWords[i],
      status: "extra",
      wordIndex: i,
      typedWord: inputWords[i]
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

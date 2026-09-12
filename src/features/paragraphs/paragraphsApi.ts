import { api } from "@/lib/api";

export type Language = "english" | "marathi";
export type Category = "lessons" | "court-exam" | "mpsc" | "high-court";

export type AccessType = "free" | "free-after-login" | "paid";

/** Which entry point a Court Exam paragraph is being viewed through. "Latest
 * High Court" reuses Court Exam's exact passages (same stored category), so
 * this is the only signal that can distinguish which of the two separately-
 * sold products should be required — it must be sent with the request, not
 * derived from the paragraph's own stored fields. */
export type ParagraphViewContext = "court-exam" | "high-court";

export type ParagraphListItem = {
  _id: string;
  title: string;
  isFree: boolean;
  accessType?: AccessType;
  language: Language;
  category: Category;
  solvedCount: number;
  createdAt: string;
  solvedByUser?: boolean;
  order?: number;
};

export type ParagraphsResponse = {
  items: ParagraphListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PriceFilter = "all" | "free" | "paid";

export type FetchParagraphsParams = {
  language: Language;
  category?: Category;
  price?: PriceFilter;
  page?: number;
  limit?: number;
};

export async function fetchParagraphs(
  params: FetchParagraphsParams
): Promise<ParagraphsResponse> {
  const { language, category, price, page = 1, limit = 24 } = params;
  const queryParams: Record<string, string | number> = {
    language,
    page,
    limit
  };
  if (category) queryParams.category = category;
  if (price && price !== "all") queryParams.price = price;
  const { data } = await api.get<ParagraphsResponse>("/paragraphs", {
    params: queryParams
  });
  return data;
}

export type ParagraphDetail = ParagraphListItem & { text: string };

export async function fetchParagraphById(
  id: string,
  context?: ParagraphViewContext
): Promise<ParagraphDetail> {
  const { data } = await api.get<ParagraphDetail>(`/paragraphs/${id}`, {
    params: context ? { context } : undefined
  });
  return data;
}

export type TypingSubmissionPayload = {
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
  /** For genuine-candidate ranking: total words in passage (correct + incorrect + omitted). */
  totalPassageWords?: number;
  omittedWordsCount?: number;
};

export async function submitTypingResult(
  paragraphId: string,
  payload: TypingSubmissionPayload,
  context?: ParagraphViewContext
): Promise<{ _id: string }> {
  const { data } = await api.post<{ _id: string }>(
    `/paragraphs/${paragraphId}/submissions`,
    payload,
    { params: context ? { context } : undefined }
  );
  return data;
}

export type LeaderboardEntry = {
  rank: number;
  userName: string;
  timeTakenSeconds: number;
  wpm: number;
  accuracy: number;
  createdAt?: string;
  isYou?: boolean;
};

export type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
  yourRank: number | null;
  yourBest: LeaderboardEntry | null;
};

export async function fetchLeaderboard(
  paragraphId: string
): Promise<LeaderboardResponse> {
  const { data } = await api.get<LeaderboardResponse>(
    `/paragraphs/${paragraphId}/submissions/leaderboard`
  );
  return data;
}

export type HistorySubmission = {
  _id: unknown;
  timeTakenSeconds: number;
  wpm: number;
  accuracy: number;
  correctWordsCount: number;
  incorrectWordsCount: number;
  createdAt?: string;
};

export type HistoryStats = {
  totalAttempts: number;
  bestTimeSeconds: number;
  bestWpm: number;
  avgAccuracy: number;
};

export type HistoryResponse = {
  submissions: HistorySubmission[];
  stats: HistoryStats;
};

export async function fetchHistory(
  paragraphId: string
): Promise<HistoryResponse> {
  const { data } = await api.get<HistoryResponse>(
    `/paragraphs/${paragraphId}/submissions/history`
  );
  return data;
}

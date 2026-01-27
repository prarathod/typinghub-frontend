import { api } from "@/lib/api";

export type Difficulty = "easy" | "intermediate" | "hard";
export type Language = "english" | "marathi";
export type Category = "lessons" | "court-exam" | "mpsc";

export type ParagraphListItem = {
  _id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  isFree: boolean;
  language: Language;
  category: Category;
  solvedCount: number;
  createdAt: string;
  solvedByUser?: boolean;
};

export type ParagraphsResponse = {
  items: ParagraphListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PriceFilter = "all" | "free" | "paid";
export type DifficultyFilter = "all" | Difficulty;

export type FetchParagraphsParams = {
  language: Language;
  category?: Category;
  price?: PriceFilter;
  difficulty?: DifficultyFilter;
  page?: number;
  limit?: number;
};

export async function fetchParagraphs(
  params: FetchParagraphsParams
): Promise<ParagraphsResponse> {
  const { language, category, price, difficulty, page = 1, limit = 12 } = params;
  const queryParams: Record<string, string | number> = {
    language,
    page,
    limit
  };
  if (category) queryParams.category = category;
  if (price && price !== "all") queryParams.price = price;
  if (difficulty && difficulty !== "all") queryParams.difficulty = difficulty;
  const { data } = await api.get<ParagraphsResponse>("/paragraphs", {
    params: queryParams
  });
  return data;
}

export type ParagraphDetail = ParagraphListItem & { text: string };

export async function fetchParagraphById(id: string): Promise<ParagraphDetail> {
  const { data } = await api.get<ParagraphDetail>(`/paragraphs/${id}`);
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
};

export async function submitTypingResult(
  paragraphId: string,
  payload: TypingSubmissionPayload
): Promise<{ _id: string }> {
  const { data } = await api.post<{ _id: string }>(
    `/paragraphs/${paragraphId}/submissions`,
    payload
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

import axios from "axios";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  isPaid: boolean;
  avatarUrl?: string;
  createdAt: string;
  submissionCount?: number;
};

export type AdminParagraph = {
  _id: string;
  title: string;
  isFree: boolean;
  language: "english" | "marathi";
  category: "lessons" | "court-exam" | "mpsc";
  solvedCount: number;
  text: string;
  published: boolean;
  createdAt: string;
};

export type AdminSubmission = {
  _id: string;
  paragraphId: { _id: string; title: string } | string;
  userId: { _id: string; name: string; email: string } | string | null;
  timeTakenSeconds: number;
  wpm: number;
  accuracy: number;
  wordsTyped: number;
  correctWordsCount: number;
  incorrectWordsCount: number;
  createdAt: string;
};

export type AdminStats = {
  totalUsers: number;
  totalParagraphs: number;
  totalSubmissions: number;
  recentSubmissions: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    avgWpm: number;
    avgAccuracy: number;
    submissionCount: number;
  }>;
  popularParagraphs: Array<{
    paragraphId: string;
    paragraphTitle: string;
    submissionCount: number;
  }>;
  submissionsByDay: Array<{ _id: string; count: number }>;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

adminApi.interceptors.request.use((config) => {
  const token = useAdminAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAdminAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ token: string; username: string }> {
  const { data } = await adminApi.post<{ token: string; username: string }>(
    "/admin/login",
    { username, password }
  );
  return data;
}

export async function logoutAdmin(): Promise<void> {
  await adminApi.post("/admin/logout");
}

export async function getAdminMe(): Promise<{ username: string; role: string }> {
  const { data } = await adminApi.get<{ username: string; role: string }>("/admin/me");
  return data;
}

export async function fetchUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isPaid?: string;
}): Promise<PaginatedResponse<AdminUser>> {
  const { data } = await adminApi.get<PaginatedResponse<AdminUser>>("/admin/users", {
    params
  });
  return data;
}

export async function fetchUser(id: string): Promise<AdminUser> {
  const { data } = await adminApi.get<AdminUser>(`/admin/users/${id}`);
  return data;
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; isPaid?: boolean }
): Promise<AdminUser> {
  const { data: result } = await adminApi.put<AdminUser>(`/admin/users/${id}`, data);
  return result;
}

export async function deleteUser(id: string): Promise<void> {
  await adminApi.delete(`/admin/users/${id}`);
}

export async function fetchParagraphs(params?: {
  page?: number;
  limit?: number;
  language?: string;
  category?: string;
}): Promise<PaginatedResponse<AdminParagraph>> {
  const { data } = await adminApi.get<PaginatedResponse<AdminParagraph>>(
    "/admin/paragraphs",
    { params }
  );
  return data;
}

export async function fetchParagraph(id: string): Promise<AdminParagraph> {
  const { data } = await adminApi.get<AdminParagraph>(`/admin/paragraphs/${id}`);
  return data;
}

export async function createParagraph(
  data: Omit<AdminParagraph, "_id" | "solvedCount" | "createdAt">
): Promise<AdminParagraph> {
  const { data: result } = await adminApi.post<AdminParagraph>("/admin/paragraphs", data);
  return result;
}

export async function updateParagraph(
  id: string,
  data: Partial<Omit<AdminParagraph, "_id" | "solvedCount" | "createdAt">>
): Promise<AdminParagraph> {
  const { data: result } = await adminApi.put<AdminParagraph>(
    `/admin/paragraphs/${id}`,
    data
  );
  return result;
}

export async function deleteParagraph(id: string): Promise<void> {
  await adminApi.delete(`/admin/paragraphs/${id}`);
}

export async function updateParagraphPublished(
  id: string,
  published: boolean
): Promise<AdminParagraph> {
  const { data } = await adminApi.put<AdminParagraph>(`/admin/paragraphs/${id}`, {
    published
  });
  return data;
}

export async function fetchSubmissions(params?: {
  page?: number;
  limit?: number;
  paragraphId?: string;
  userId?: string;
  sortBy?: string;
}): Promise<PaginatedResponse<AdminSubmission>> {
  const { data } = await adminApi.get<PaginatedResponse<AdminSubmission>>(
    "/admin/submissions",
    { params }
  );
  return data;
}

export async function fetchStats(): Promise<AdminStats> {
  const { data } = await adminApi.get<AdminStats>("/admin/stats");
  return data;
}

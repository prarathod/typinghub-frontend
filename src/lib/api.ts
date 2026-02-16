import axios from "axios";

import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const hadToken = Boolean(useAuthStore.getState().token);
      if (hadToken) {
        useAuthStore.getState().setSessionInvalidated(true);
      }
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export const getApiBaseUrl = () => API_BASE_URL;

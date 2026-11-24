import axios from "axios";

/**
 * Base URL of the backend server.
 * - In development this is empty: Vite proxies /api and /uploads to the backend (see vite.config.ts).
 * - In production it comes from VITE_API_URL (see .env.production).
 */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export const TOKEN_KEY = "token";

/** Fired when the backend rejects our token, so the app can log the user out. */
export const UNAUTHORIZED_EVENT = "agora:unauthorized";

/** Turns a server path like "/uploads/abc.pdf" into a full URL. */
export function fileUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Extracts a human readable message from an API error. */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Can't reach the server. Check your connection or make sure the backend is running.";
    }
    const data = error.response.data as { message?: unknown } | undefined;
    if (data && typeof data.message === "string" && data.message) {
      return data.message;
    }
    if (error.response.status === 401) return "Please log in to continue.";
    if (error.response.status === 403) return "You don't have permission to do that.";
    if (error.response.status === 404) return "Not found.";
  }
  return fallback;
}

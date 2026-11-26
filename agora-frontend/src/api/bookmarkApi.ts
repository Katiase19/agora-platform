import apiClient from "./client";
import type { ThreadResponse } from "../types/forum";

export async function getBookmarks(): Promise<ThreadResponse[]> {
  const response = await apiClient.get<ThreadResponse[]>("/bookmarks");
  return response.data;
}

export async function addBookmark(threadId: number): Promise<void> {
  await apiClient.post(`/bookmarks/threads/${threadId}`);
}

export async function removeBookmark(threadId: number): Promise<void> {
  await apiClient.delete(`/bookmarks/threads/${threadId}`);
}

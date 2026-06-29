import apiClient from "./client";
import type { ThreadResponse, ReplyResponse } from "../types/forum";

export async function getThreads(): Promise<ThreadResponse[]> {
  const response = await apiClient.get<ThreadResponse[]>("/forum/threads");
  return response.data;
}

export async function getThreadById(id: number): Promise<ThreadResponse> {
  const response = await apiClient.get<ThreadResponse>(`/forum/threads/${id}`);
  return response.data;
}

export async function getRepliesForThread(id: number): Promise<ReplyResponse[]> {
  const response = await apiClient.get<ReplyResponse[]>(
    `/forum/threads/${id}/replies`
  );
  return response.data;
}
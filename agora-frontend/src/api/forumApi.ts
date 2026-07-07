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
interface CreateThreadRequest {
  title: string;
  body: string;
  courseTag: string;
}

export async function createThread(
  data: CreateThreadRequest
): Promise<ThreadResponse> {
  const response = await apiClient.post<ThreadResponse>("/forum/threads", data);
  return response.data;
}
interface CreateReplyRequest {
  body: string;
}

export async function createReply(
  threadId: number,
  data: CreateReplyRequest
): Promise<ReplyResponse> {
  const response = await apiClient.post<ReplyResponse>(
    `/forum/threads/${threadId}/replies`,
    data
  );
  return response.data;
}
import apiClient from "./client";
import type {
  ThreadResponse,
  ReplyResponse,
  VoteResponse,
  VoteTargetType,
} from "../types/forum";

// ---------- Threads ----------

export async function getThreads(): Promise<ThreadResponse[]> {
  const response = await apiClient.get<ThreadResponse[]>("/forum/threads");
  return response.data;
}

export async function getThreadById(id: number): Promise<ThreadResponse> {
  const response = await apiClient.get<ThreadResponse>(`/forum/threads/${id}`);
  return response.data;
}

export async function getThreadsByUser(userId: number): Promise<ThreadResponse[]> {
  const response = await apiClient.get<ThreadResponse[]>(`/forum/threads/user/${userId}`);
  return response.data;
}

export async function searchThreads(keyword: string): Promise<ThreadResponse[]> {
  const response = await apiClient.get<ThreadResponse[]>("/forum/threads/search", {
    params: { keyword },
  });
  return response.data;
}

export interface CreateThreadRequest {
  title: string;
  body: string;
  courseTag: string;
}

export async function createThread(data: CreateThreadRequest): Promise<ThreadResponse> {
  const response = await apiClient.post<ThreadResponse>("/forum/threads", data);
  return response.data;
}

export async function updateThread(id: number, data: CreateThreadRequest): Promise<ThreadResponse> {
  const response = await apiClient.put<ThreadResponse>(`/forum/threads/${id}`, data);
  return response.data;
}

export async function deleteThread(id: number): Promise<void> {
  await apiClient.delete(`/forum/threads/${id}`);
}

// ---------- Replies ----------

export async function getRepliesForThread(id: number): Promise<ReplyResponse[]> {
  const response = await apiClient.get<ReplyResponse[]>(`/forum/threads/${id}/replies`);
  return response.data;
}

interface CreateReplyRequest {
  body: string;
}

export async function createReply(threadId: number, data: CreateReplyRequest): Promise<ReplyResponse> {
  const response = await apiClient.post<ReplyResponse>(`/forum/threads/${threadId}/replies`, data);
  return response.data;
}

export async function updateReply(replyId: number, data: CreateReplyRequest): Promise<ReplyResponse> {
  const response = await apiClient.put<ReplyResponse>(`/forum/replies/${replyId}`, data);
  return response.data;
}

export async function deleteReply(replyId: number): Promise<void> {
  await apiClient.delete(`/forum/replies/${replyId}`);
}

export async function acceptReply(threadId: number, replyId: number): Promise<ReplyResponse> {
  const response = await apiClient.patch<ReplyResponse>(
    `/forum/threads/${threadId}/replies/${replyId}/accept`
  );
  return response.data;
}

// ---------- Votes ----------

export async function castVote(
  targetType: VoteTargetType,
  targetId: number,
  value: 1 | -1
): Promise<VoteResponse> {
  const response = await apiClient.post<VoteResponse>("/forum/votes", {
    targetType,
    targetId,
    value,
  });
  return response.data;
}

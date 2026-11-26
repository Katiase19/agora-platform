import apiClient from "./client";
import type { NotificationResponse } from "../types/forum";

export async function getNotifications(): Promise<NotificationResponse[]> {
  const response = await apiClient.get<NotificationResponse[]>("/notifications");
  return response.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>("/notifications/unread-count");
  return response.data.count;
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}

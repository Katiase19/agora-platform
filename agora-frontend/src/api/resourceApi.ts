import apiClient from "./client";
import type { ResourceResponse, ResourceType } from "../types/forum";

export async function getResources(): Promise<ResourceResponse[]> {
  const response = await apiClient.get<ResourceResponse[]>("/resources");
  return response.data;
}

export async function getTrendingResources(): Promise<ResourceResponse[]> {
  const response = await apiClient.get<ResourceResponse[]>("/resources/trending");
  return response.data;
}

export async function getResourcesByUser(userId: number): Promise<ResourceResponse[]> {
  const response = await apiClient.get<ResourceResponse[]>(`/resources/user/${userId}`);
  return response.data;
}

export interface UploadResourceRequest {
  title: string;
  description?: string;
  resourceType: ResourceType;
  courseCode: string;
  courseName?: string;
  year?: number;
  semester?: string;
  file: File;
}

export async function uploadResource(
  data: UploadResourceRequest,
  onProgress?: (percent: number) => void
): Promise<ResourceResponse> {
  const form = new FormData();
  form.append("title", data.title);
  form.append("resourceType", data.resourceType);
  form.append("courseCode", data.courseCode);
  if (data.description) form.append("description", data.description);
  if (data.courseName) form.append("courseName", data.courseName);
  if (data.year) form.append("year", String(data.year));
  if (data.semester) form.append("semester", data.semester);
  form.append("file", data.file);

  const response = await apiClient.post<ResourceResponse>("/resources/upload", form, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return response.data;
}

/** Records the download and returns the file's path on the server. */
export async function registerDownload(id: number): Promise<string> {
  const response = await apiClient.get<string>(`/resources/${id}/download`, {
    responseType: "text",
  });
  return response.data;
}

export async function deleteResource(id: number): Promise<void> {
  await apiClient.delete(`/resources/${id}`);
}

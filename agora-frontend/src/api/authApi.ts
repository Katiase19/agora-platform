import apiClient from "./client";
import type { AuthResponse, User } from "../types/forum";

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  courseOfStudy?: string;
  academicYear?: number;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", data);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}

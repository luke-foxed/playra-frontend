import apiClient from "../../../lib/api_client";
import type { Profile } from "./schema";

export async function getProfile(userId: string): Promise<Profile> {
  const { data: response } = await apiClient.get(`/v1/profile/${userId}`);
  return response.data;
}

export async function updateProfile(userId: string, updates: Partial<Pick<Profile, "username" | "avatar_url">>): Promise<void> {
  await apiClient.patch(`/v1/profile/${userId}`, updates);
}
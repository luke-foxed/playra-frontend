import { z } from "zod"
import { queryOptions } from "@tanstack/react-query"
import apiClient from "../../../lib/api_client"
import { AdminUserSchema } from "./schemas"
import type { UserRole } from "./schemas"

export async function getAdminUsers(): Promise<z.infer<typeof AdminUserSchema>[]> {
  const { data: response } = await apiClient.get("/v1/admin/users")
  return z.array(AdminUserSchema).parse(response.data)
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await apiClient.patch(`/v1/admin/users/${userId}/role`, { role })
}

export const adminUsersQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "users"],
    queryFn: () => getAdminUsers(),
    staleTime: 30 * 1000,
  })

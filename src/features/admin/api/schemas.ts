import { z } from "zod"

export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
  role: z.enum(["suspended", "pending", "active", "admin"]),
  created_at: z.string().optional(),
})

export type AdminUser = z.infer<typeof AdminUserSchema>
export type UserRole = "suspended" | "pending" | "active" | "admin"

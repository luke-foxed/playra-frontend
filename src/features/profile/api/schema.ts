import { z } from "zod"

export const ProfileSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
  role: z.enum(["suspended", "pending", "active", "admin"]),
})

export type Profile = z.infer<typeof ProfileSchema>
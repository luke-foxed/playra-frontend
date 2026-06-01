import { z } from "zod"
import { GenreSchema } from "../../games/api/schemas"

export const ListTypeSchema = z.enum(["wishlist", "ratings", "custom"]).catch("custom")

export const ListGameSchema = z.object({
  game_id: z.number(),
  name: z.string(),
  released: z.string().nullable().catch(null),
  genres: z.array(GenreSchema).catch([]),
  metacritic: z.number().nullable().catch(null),
  background_image: z.string().nullable().catch(null),
  user_rating: z.number().nullable().optional(),
})

export const ListCreatorSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
})

export const ListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().catch(null),
  cover_url: z.string().nullable().catch(null),
  is_public: z.boolean().catch(false),
  type: ListTypeSchema,
  game_count: z.number().optional().catch(undefined),
  created_by: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const PublicListSchema = ListSchema.extend({
  profiles: ListCreatorSchema.nullable().catch(null),
})

export const ListDetailSchema = ListSchema.extend({
  games: z.array(ListGameSchema).catch([]),
  profiles: ListCreatorSchema.nullable().catch(null),
})

export type ListType = z.infer<typeof ListTypeSchema>
export type ListGame = z.infer<typeof ListGameSchema>
export type ListCreator = z.infer<typeof ListCreatorSchema>
export type List = z.infer<typeof ListSchema>
export type PublicList = z.infer<typeof PublicListSchema>
export type ListDetail = z.infer<typeof ListDetailSchema>

export type CreateListInput = {
  name: string
  description: string | null
  cover_url?: string | null
  is_public: boolean
}

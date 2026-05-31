import { z } from "zod"

// Response schemas
export const GenreSchema = z.object({ id: z.number(), name: z.string(), slug: z.string() })
export const PlatformSchema = z.object({
  platform: z.object({ id: z.number(), name: z.string(), slug: z.string() }),
})
export const RatingSchema = z.object({
  id: z.number(),
  title: z.string(),
  count: z.number(),
  percent: z.number(),
})
export const ScreenshotSchema = z.object({ id: z.number(), image: z.string() })
export const DeveloperSchema = z.object({ id: z.number(), name: z.string(), slug: z.string() })
export const PublisherSchema = z.object({ id: z.number(), name: z.string(), slug: z.string() })
export const TagSchema = z.object({ id: z.number(), name: z.string(), slug: z.string() })

export const GameSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  released: z.string().nullable(),
  background_image: z.string().nullable(),
  background_image_additional: z.string().optional(),
  rating: z.number(),
  rating_top: z.number(),
  ratings: z.array(RatingSchema),
  ratings_count: z.number(),
  metacritic: z.number().nullable(),
  genres: z.array(GenreSchema),
  platforms: z.array(PlatformSchema),
  short_screenshots: z.array(ScreenshotSchema).optional(),
})

export const EsrbRatingSchema = z.object({ id: z.number(), name: z.string(), slug: z.string() })

export const GameDetailSchema = GameSchema.extend({
  description_raw: z.string(),
  website: z.string(),
  playtime: z.number(),
  developers: z.array(DeveloperSchema),
  publishers: z.array(PublisherSchema),
  tags: z.array(TagSchema),
  esrb_rating: EsrbRatingSchema.nullable().optional(),
})

export type Genre = z.infer<typeof GenreSchema>
export type Platform = z.infer<typeof PlatformSchema>
export type Rating = z.infer<typeof RatingSchema>
export type Screenshot = z.infer<typeof ScreenshotSchema>
export type Developer = z.infer<typeof DeveloperSchema>
export type Publisher = z.infer<typeof PublisherSchema>
export type Tag = z.infer<typeof TagSchema>
export type Game = z.infer<typeof GameSchema>
export type GameDetail = z.infer<typeof GameDetailSchema>

// Search params schema
const orderingValues = [
  "name", "released", "added", "created", "updated", "rating", "metacritic",
  "-name", "-released", "-added", "-created", "-updated", "-rating", "-metacritic",
] as const

export const GamesSearchSchema = z.object({
  page: z.number().int().positive().catch(1),
  page_size: z.number().int().positive().catch(20),
  search: z.string().optional(),
  search_precise: z.boolean().optional(),
  search_exact: z.boolean().optional(),
  parent_platforms: z.string().optional(),
  platforms: z.string().optional(),
  stores: z.string().optional(),
  developers: z.string().optional(),
  publishers: z.string().optional(),
  genres: z.string().optional(),
  tags: z.string().optional(),
  creators: z.string().optional(),
  dates: z.string().optional(),
  updated: z.string().optional(),
  platforms_count: z.number().int().optional(),
  metacritic: z.string().optional(),
  exclude_collection: z.number().int().optional(),
  exclude_additions: z.boolean().optional(),
  exclude_parents: z.boolean().optional(),
  exclude_game_series: z.boolean().optional(),
  exclude_stores: z.string().optional(),
  ordering: z.enum(orderingValues).optional(),
})

export type GetGamesParams = z.infer<typeof GamesSearchSchema>

export const paginatedResponse = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(schema),
  })

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const GamesResponseSchema = paginatedResponse(GameSchema)

export type GamesResponse = z.infer<typeof GamesResponseSchema>

export const UserGameSchema = z.object({
  in_wishlist: z.boolean(),
  rating: z.number().nullable().optional(),
  lists: z.array(z.object({ id: z.string(), name: z.string() })),
})

export type UserGame = z.infer<typeof UserGameSchema>

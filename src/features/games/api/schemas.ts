import { z } from "zod"

// Response schemas

// The standalone `/genres` endpoint returns {id, name, slug}. Genres embedded on a
// game object don't carry a slug (IGDB doesn't give one in that context), so they
// get their own lighter schema below.
export const GenreSchema = z.object({ id: z.number(), name: z.string(), slug: z.string() })
export const GameGenreSchema = z.object({ id: z.number(), name: z.string() })
export const PlatformSchema = z.object({
  id: z.number(),
  name: z.string(),
  abbreviation: z.string().nullable().optional(),
})

export const GameSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  summary: z.string().nullable().optional(),
  first_release_date: z.number().nullable(), // unix timestamp
  cover_url: z.string().nullable(),
  rating: z.number().nullable(),              // 0-100, IGDB user rating
  aggregated_rating: z.number().nullable(),   // 0-100, critic score
  total_rating: z.number().nullable(),        // 0-100, blended
  total_rating_count: z.number().nullable(),
  playra_community_score: z.number().nullable().catch(null),
  genres: z.array(GameGenreSchema).catch([]),
  platforms: z.array(PlatformSchema).catch([]),
})

export const GameDetailSchema = GameSchema.extend({
  storyline: z.string().nullable().optional(),
  developers: z.array(z.string()).catch([]),
  publishers: z.array(z.string()).catch([]),
  screenshot_urls: z.array(z.string()).catch([]),
  website: z.string().nullable().optional(),
})

export type Genre = z.infer<typeof GenreSchema>
export type GameGenre = z.infer<typeof GameGenreSchema>
export type Platform = z.infer<typeof PlatformSchema>
export type Game = z.infer<typeof GameSchema>
export type GameDetail = z.infer<typeof GameDetailSchema>

// Search params schema
const orderingValues = [
  "name", "-name",
  "first_release_date", "-first_release_date",
  "rating", "-rating",
  "total_rating", "-total_rating",
  "total_rating_count", "-total_rating_count",
] as const

export const GamesSearchSchema = z.object({
  page: z.number().int().positive().catch(1),
  page_size: z.number().int().positive().catch(20),
  search: z.string().optional(),
  genres: z.string().optional(),               // comma-separated ids
  platforms: z.string().optional(),             // comma-separated ids
  themes: z.string().optional(),                // comma-separated ids
  game_modes: z.string().optional(),            // comma-separated ids
  player_perspectives: z.string().optional(),   // comma-separated ids
  release_year_min: z.number().int().optional(),
  release_year_max: z.number().int().optional(),
  rating_min: z.number().optional(),
  rating_max: z.number().optional(),
  ordering: z.enum(orderingValues).optional(),
})

export type GetGamesParams = z.infer<typeof GamesSearchSchema>

export const GamesResponseSchema = z.object({
  results: z.array(GameSchema),
  page: z.number(),
  page_size: z.number(),
  has_more: z.boolean(),
})

export type GamesResponse = z.infer<typeof GamesResponseSchema>

export const ScreenshotsResponseSchema = z.object({
  results: z.array(z.string()), // resolved images.igdb.com URLs
})

export type ScreenshotsResponse = z.infer<typeof ScreenshotsResponseSchema>

// Replaces RAWG's flat "game series" list. IGDB's collection (franchise) and
// similar_games don't map 1:1 to a single games list.
export const RelatedGameSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  cover_url: z.string().nullable(),
  first_release_date: z.number().nullable(),
  total_rating: z.number().nullable().optional(),
})

export const GameRelatedResponseSchema = z.object({
  collection_name: z.string().nullable(),
  collection_games: z.array(RelatedGameSchema).catch([]),
  similar_games: z.array(RelatedGameSchema).catch([]),
})

export type RelatedGame = z.infer<typeof RelatedGameSchema>
export type GameRelated = z.infer<typeof GameRelatedResponseSchema>

export const UserGameSchema = z.object({
  in_wishlist: z.boolean(),
  rating: z.number().nullable().optional(),
  lists: z.array(z.object({ id: z.string(), name: z.string() })),
})

export type UserGame = z.infer<typeof UserGameSchema>

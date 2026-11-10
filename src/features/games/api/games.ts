import { queryOptions } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import apiClient from "../../../lib/api_client"
import { GameDetailSchema, GamesResponseSchema, UserGameSchema, ScreenshotsResponseSchema, GameRelatedResponseSchema } from "./schemas"
import type { GameDetail, GamesResponse, GetGamesParams, UserGame, ScreenshotsResponse, GameRelated } from "./schemas"

const EMPTY_RELATED: GameRelated = { collection_name: null, collection_games: [], similar_games: [] }

export async function getGames(params?: GetGamesParams): Promise<GamesResponse> {
  const { data: response } = await apiClient.get("/v1/games", { params })
  return GamesResponseSchema.parse(response.data)
}

export async function getPopularGames(page_size = 10): Promise<GamesResponse> {
  const { data: response } = await apiClient.get("/v1/games/popular", { params: { page_size } })
  return GamesResponseSchema.parse(response.data)
}

export async function getRecentGames(page_size = 10): Promise<GamesResponse> {
  const { data: response } = await apiClient.get("/v1/games/recent", { params: { page_size } })
  return GamesResponseSchema.parse(response.data)
}

export async function getGame(id: number): Promise<GameDetail> {
  const { data: response } = await apiClient.get(`/v1/games/${id}`)
  return GameDetailSchema.parse(response.data)
}

export async function getUserGame(id: number): Promise<UserGame> {
  const { data: response } = await apiClient.get(`/v1/games/${id}/user`)
  return UserGameSchema.parse(response.data)
}

export async function getGameRelated(id: number): Promise<GameRelated> {
  try {
    const { data: response } = await apiClient.get(`/v1/games/${id}/related`)
    const parsed = GameRelatedResponseSchema.safeParse(response.data)
    return parsed.success ? parsed.data : EMPTY_RELATED
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return EMPTY_RELATED
    throw error
  }
}

export async function getGameScreenshots(id: number): Promise<ScreenshotsResponse> {
  const { data: response } = await apiClient.get(`/v1/games/${id}/screenshots`)
  return ScreenshotsResponseSchema.parse(response.data)
}

export const gameQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["game", id], queryFn: () => getGame(id), staleTime: Infinity })

export const userGameQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["userGame", id], queryFn: () => getUserGame(id) })

export const gamesQueryOptions = (params: GetGamesParams) =>
  queryOptions({
    // sorted so the same params in a different key order share one cache entry
    queryKey: ["games", Object.fromEntries(Object.entries(params).sort())],
    queryFn: () => getGames(params),
    staleTime: 5 * 60 * 1000,
  })

export const popularGamesQueryOptions = (page_size = 10) =>
  queryOptions({
    queryKey: ["games", "popular", page_size],
    queryFn: () => getPopularGames(page_size),
    staleTime: 5 * 60 * 1000,
  })

export const recentGamesQueryOptions = (page_size = 10) =>
  queryOptions({
    queryKey: ["games", "recent", page_size],
    queryFn: () => getRecentGames(page_size),
    staleTime: 5 * 60 * 1000,
  })

export const gameRelatedQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["games", "related", id],
    queryFn: () => getGameRelated(id),
    staleTime: 5 * 60 * 1000,
  })

export const gameScreenshotsQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["game", id, "screenshots"],
    queryFn: () => getGameScreenshots(id),
    staleTime: Infinity,
  })

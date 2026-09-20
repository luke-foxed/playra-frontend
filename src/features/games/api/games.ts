
import { queryOptions } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import apiClient from "../../../lib/api_client"
import { GameDetailSchema, GamesResponseSchema, UserGameSchema, ScreenshotsResponseSchema } from "./schemas"
import type { GameDetail, GamesResponse, GetGamesParams, UserGame, Game, ScreenshotsResponse } from "./schemas"

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

export async function getGameSeries(id: number): Promise<Game[]> {
  try {
    const { data: response } = await apiClient.get(`/v1/games/${id}/game-series`)
    const parsed = GamesResponseSchema.safeParse(response.data)
    return parsed.success ? parsed.data.results : []
  } catch (error) {
    // not every game has a series; anything else (network, 5xx) is a real failure
    if (isAxiosError(error) && error.response?.status === 404) return []
    throw error
  }
}

export async function getSimilarGames(id: number, game: GameDetail): Promise<Game[]> {
  const TARGET = 10

  const series = (await getGameSeries(id)).filter((g) => g.id !== id)
  if (series.length >= TARGET) return series.slice(0, TARGET)

  const needed = TARGET - series.length
  const exclude = new Set([id, ...series.map((g) => g.id)])
  const genreId = game.genres[0]?.id
  if (!genreId) return series

  const data = await getGames({ page: 1, page_size: needed + 8, genres: String(genreId), ordering: '-metacritic' })
  const filler = data.results.filter((g) => !exclude.has(g.id)).slice(0, needed)
  return [...series, ...filler]
}

export async function getGameScreenshots(id: number): Promise<ScreenshotsResponse> {
  const { data: response } = await apiClient.get(`/v1/games/${id}/screenshots`)
  return ScreenshotsResponseSchema.parse(response.data)
}

export async function submitReview(gameId: number, score: number): Promise<void> {
  await apiClient.post(`/v1/games/${gameId}/reviews`, { score })
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

export const similarGamesQueryOptions = (id: number, game: GameDetail) =>
  queryOptions({
    queryKey: ["games", "similar", id],
    queryFn: () => getSimilarGames(id, game),
    staleTime: 5 * 60 * 1000,
  })

export const gameScreenshotsQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["game", id, "screenshots"],
    queryFn: () => getGameScreenshots(id),
    staleTime: Infinity,
  })

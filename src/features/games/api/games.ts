
import { queryOptions } from "@tanstack/react-query"
import apiClient from "../../../lib/api_client"
import { GameDetailSchema, GamesResponseSchema, UserGameSchema } from "./schemas"
import type { GameDetail, GamesResponse, GetGamesParams, UserGame } from "./schemas"


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

export async function submitReview(gameId: number, score: number): Promise<void> {
  await apiClient.post(`/v1/games/${gameId}/reviews`, { score })
}

export const gameQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["game", id], queryFn: () => getGame(id), staleTime: Infinity })

export const userGameQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["userGame", id], queryFn: () => getUserGame(id) })

export const gamesQueryOptions = (params: GetGamesParams) =>
  queryOptions({
    queryKey: ["games", params],
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

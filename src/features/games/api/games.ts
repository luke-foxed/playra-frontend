
import apiClient from "../../../lib/api_client"
import { GameDetailSchema, GamesResponseSchema } from "./schemas"
import type { GameDetail, GamesResponse, GetGamesParams } from "./schemas"


export async function getGames(params?: GetGamesParams): Promise<GamesResponse> {
  const { data: response } = await apiClient.get("/v1/games", { params })
  return GamesResponseSchema.parse(response.data)
}

export async function getGame(id: number): Promise<GameDetail> {
  const { data: response } = await apiClient.get(`/v1/games/${id}`)
  return GameDetailSchema.parse(response.data)
}
 
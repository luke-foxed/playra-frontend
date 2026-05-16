import { z } from "zod"
import apiClient from "../../../lib/api_client"
import { paginatedResponse } from "../../../api/types"
import { GameSchema, GameDetailSchema } from "./schemas"
import type { Game, GameDetail, GetGamesParams } from "./schemas"

export type { Game, GameDetail }

const GamesResponseSchema = paginatedResponse(GameSchema)
type GamesResponse = z.infer<typeof GamesResponseSchema>

export async function getGames(params?: GetGamesParams): Promise<GamesResponse> {
  const { data: response } = await apiClient.get("/v1/games", { params })
  return GamesResponseSchema.parse(response.data)
}

export async function getGame(id: number): Promise<GameDetail> {
  const { data: response } = await apiClient.get(`/v1/games/${id}`)
  return GameDetailSchema.parse(response.data)
}

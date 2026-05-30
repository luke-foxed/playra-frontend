import { z } from "zod"
import { queryOptions } from "@tanstack/react-query"
import apiClient from "../../../lib/api_client"
import { ListDetailSchema, ListSchema } from "./schemas"
import type { CreateListInput, List, ListDetail, ListGame } from "./schemas"

export async function getLists(params?: {
  user_id?: string
  page?: number
  page_size?: number
  ordering?: string
}): Promise<List[]> {
  const { data: response } = await apiClient.get("/v1/lists", { params })
  return z.array(ListSchema).parse(response.data)
}

export async function getList(id: string): Promise<ListDetail> {
  const { data: response } = await apiClient.get(`/v1/lists/${id}`)
  return ListDetailSchema.parse(response.data)
}

export async function createList(input: CreateListInput): Promise<List> {
  const { data: response } = await apiClient.post("/v1/lists", input)
  return ListSchema.parse(response.data)
}

export async function updateList(id: string, input: CreateListInput): Promise<List> {
  const { data: response } = await apiClient.put(`/v1/lists/${id}`, input)
  return ListSchema.parse(response.data)
}

export async function deleteList(id: string): Promise<void> {
  await apiClient.delete(`/v1/lists/${id}`)
}

export async function addGamesToList(id: string, games: ListGame[]): Promise<void> {
  await apiClient.post(`/v1/lists/${id}/games`, { games })
}

export async function removeGamesFromList(id: string, gameIds: number[]): Promise<void> {
  await apiClient.delete(`/v1/lists/${id}/games`, { data: { game_ids: gameIds } })
}


export const listsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["lists", userId ?? "self"],
    queryFn: () => getLists(userId ? { user_id: userId } : undefined),
  })

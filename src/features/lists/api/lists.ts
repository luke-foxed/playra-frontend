import { z } from "zod"
import { queryOptions } from "@tanstack/react-query"
import apiClient from "../../../lib/api_client"
import { ListDetailSchema, ListSchema, PublicListSchema } from "./schemas"
import type { CreateListInput, List, ListDetail, ListGame, PublicList } from "./schemas"

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

export async function updateList(id: string, input: CreateListInput): Promise<void> {
  await apiClient.put(`/v1/lists/${id}`, input)
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

export const listDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["listDetail", id],
    queryFn: () => getList(id),
    staleTime: Infinity,
  })

export async function getPublicLists(params?: { page?: number; page_size?: number }): Promise<PublicList[]> {
  const { data: response } = await apiClient.get("/v1/lists/public", { params })
  return z.array(PublicListSchema).parse(response.data)
}

export const publicListsQueryOptions = () =>
  queryOptions({
    queryKey: ["lists", "public"],
    queryFn: () => getPublicLists({ page_size: 50 }),
    staleTime: 2 * 60 * 1000,
  })

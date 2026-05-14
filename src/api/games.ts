import apiClient from "../lib/api_client"
import type { PaginatedResponse } from "./types"

export type Genre = {
  id: number
  name: string
  slug: string
}

export type Platform = {
  platform: {
    id: number
    name: string
    slug: string
  }
}

export type Rating = {
  id: number
  title: string
  count: number
  percent: number
}

export type Screenshot = {
  id: number
  image: string
}

export type Developer = {
  id: number
  name: string
  slug: string
}

export type Publisher = {
  id: number
  name: string
  slug: string
}

export type Tag = {
  id: number
  name: string
  slug: string
}

export type Game = {
  id: number
  slug: string
  name: string
  released: string
  background_image: string | null
  rating: number
  rating_top: number
  ratings: Rating[]
  ratings_count: number
  metacritic: number | null
  genres: Genre[]
  platforms: Platform[]
  short_screenshots: Screenshot[]
}

export type GameDetail = Game & {
  description_raw: string
  website: string
  developers: Developer[]
  publishers: Publisher[]
  tags: Tag[]
}

export type GetGamesParams = {
  page?: number
  page_size?: number
  search?: string
  genres?: string
  ordering?: string
}

export async function getGames(params?: GetGamesParams): Promise<PaginatedResponse<Game>> {
  const { data: response } = await apiClient.get("/v1/games", { params })
  return response.data
}

export async function getGame(id: number): Promise<GameDetail> {
  const { data: response } = await apiClient.get(`/v1/games/${id}`)
  return response.data
}

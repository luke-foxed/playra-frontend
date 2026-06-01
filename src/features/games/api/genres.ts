import apiClient from "../../../lib/api_client"
import { GenreSchema, paginatedResponse } from "./schemas"
import type { Genre } from "./schemas"

const GenresResponseSchema = paginatedResponse(GenreSchema)

export async function getGenres(): Promise<Genre[]> {
  const { data: response } = await apiClient.get("/v1/genres")
  return GenresResponseSchema.parse(response.data).results
}

import { z } from "zod"
import apiClient from "../../../lib/api_client"
import { PlatformSchema } from "./schemas"
import type { Platform } from "./schemas"

const PlatformsResponseSchema = z.object({ results: z.array(PlatformSchema) })

export async function getPlatforms(): Promise<Platform[]> {
  const { data: response } = await apiClient.get("/v1/platforms")
  return PlatformsResponseSchema.parse(response.data).results
}

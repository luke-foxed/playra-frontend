import { useQuery } from "@tanstack/react-query"
import { gameScreenshotsQueryOptions } from "../api/games"

export default function useGetGameScreenshots(id: number) {
  return useQuery(gameScreenshotsQueryOptions(id))
}

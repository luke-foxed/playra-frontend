import { useQuery } from "@tanstack/react-query"
import { recentGamesQueryOptions } from "../api/games"

export default function useGetRecentGames(pageSize = 10) {
  return useQuery(recentGamesQueryOptions(pageSize))
}

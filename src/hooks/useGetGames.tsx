import { useQuery } from "@tanstack/react-query"
import { getGames } from "../api/games"
import type { GetGamesParams } from "../api/games"

export default function useGetGames(params: GetGamesParams) {

  // sort params to ensure consistent query keys for the same parameters
  const sortedParams = Object.fromEntries(Object.entries(params).sort())

  return useQuery({
    queryKey: ["games", sortedParams],
    queryFn: () => getGames(sortedParams),
  })
}

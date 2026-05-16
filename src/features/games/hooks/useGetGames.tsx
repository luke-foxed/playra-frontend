import { useQuery } from "@tanstack/react-query"
import { getGames } from "../api/games"
import type { GetGamesParams } from "../api/schemas"

export default function useGetGames(params: GetGamesParams) {
  const sortedKey = Object.fromEntries(Object.entries(params).sort())

  return useQuery({
    queryKey: ["games", sortedKey],
    queryFn: () => getGames(params),
  })
}

import { useQuery } from "@tanstack/react-query"
import { popularGamesQueryOptions } from "../api/games"

export default function useGetPopularGames(pageSize = 10) {
  return useQuery(popularGamesQueryOptions(pageSize))
}

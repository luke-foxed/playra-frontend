import { useQuery } from "@tanstack/react-query"
import { getGame } from "../api/games"

export default function useGetGames(id: number) {
  return useQuery({
    queryKey: ["games", id],
    queryFn: () => getGame(id),
  })
}

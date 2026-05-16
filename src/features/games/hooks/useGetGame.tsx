import { useQuery } from "@tanstack/react-query"
import { getGame } from "../api/games"

export default function useGetGame(id: number) {
  return useQuery({
    queryKey: ["game", id],
    queryFn: () => getGame(id),
  })
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { addGamesToList, listDetailQueryOptions } from "../api/lists"
import { userGameQueryOptions } from "../../games/api/games"
import type { UserGame } from "../../games/api/schemas"
import type { List, ListGame, ListDetail } from "../api/schemas"

type Args = {
  score: number
  gamePayload: ListGame
}

export default function useRateGame(gameId: number, ratingsList: List | undefined) {
  const qc = useQueryClient()
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: ({ score, gamePayload }: Args) => {
      if (!ratingsList) throw new Error("Ratings list not found")
      return addGamesToList(ratingsList.id, [{ ...gamePayload, user_rating: score }])
    },
    onMutate: ({ score }) => {
      qc.setQueryData<UserGame>(userGameQueryOptions(gameId).queryKey, (prev) =>
        prev ? { ...prev, rating: score } : prev,
      )
      if (ratingsList) {
        qc.setQueryData<ListDetail>(listDetailQueryOptions(ratingsList.id).queryKey, (prev) => {
          if (!prev) return prev
          return {
            ...prev,
            games: prev.games.map((g) =>
              g.game_id === gameId ? { ...g, user_rating: score } : g,
            ),
          }
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(userGameQueryOptions(gameId))
      if (ratingsList) qc.invalidateQueries(listDetailQueryOptions(ratingsList.id))
      notifications.show({ title: "Rating saved", message: "Your score has been recorded", color: "blue" })
    },
    onError: () => {
      qc.invalidateQueries(userGameQueryOptions(gameId))
      if (ratingsList) qc.invalidateQueries(listDetailQueryOptions(ratingsList.id))
      notifications.show({ title: "Error", message: "Failed to save score", color: "red" })
    },
  })
  return { rateGame: mutateAsync, isLoading: isPending, isError }
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { addGamesToList } from "../api/lists"
import { userGameQueryOptions } from "../../games/api/games"
import type { UserGame } from "../../games/api/schemas"
import type { List, ListGame } from "../api/schemas"

type Args = {
  score: number
  gamePayload: ListGame
}

export default function useRateGame(gameId: number, playlist: List | undefined) {
  const qc = useQueryClient()
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: ({ score, gamePayload }: Args) => {
      if (!playlist) throw new Error("Playlist not found")
      return addGamesToList(playlist.id, [{ ...gamePayload, user_rating: score }])
    },
    onMutate: ({ score }) => {
      qc.setQueryData<UserGame>(userGameQueryOptions(gameId).queryKey, (prev) =>
        prev ? { ...prev, rating: score } : prev,
      )
    },
    onSuccess: () => {
      qc.invalidateQueries(userGameQueryOptions(gameId))
      notifications.show({ title: "Rating saved", message: "Your score has been recorded", color: "blue" })
    },
    onError: () => {
      qc.invalidateQueries(userGameQueryOptions(gameId))
      notifications.show({ title: "Error", message: "Failed to save score", color: "red" })
    },
  })
  return { rateGame: mutateAsync, isLoading: isPending, isError }
}

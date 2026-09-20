import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { removeGamesFromList } from "../api/lists"

export default function useRemoveGameFromList() {
  const qc = useQueryClient()
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: ({ listId, gameId }: { listId: string; gameId: number }) =>
      removeGamesFromList(listId, [gameId]),
    onSuccess: (_, { listId }) => {
      qc.invalidateQueries({ queryKey: ["listDetail", listId] })
      qc.invalidateQueries({ queryKey: ["lists"] })
    },
    onError: () => notifications.show({ title: "Error", message: "Failed to remove game", color: "red" }),
  })
  return { removeGame: mutateAsync, isLoading: isPending, isError }
}

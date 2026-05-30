import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { addGamesToList, removeGamesFromList } from "../api/lists"
import { userGameQueryOptions } from "../../games/api/games"
import type { List, ListGame } from "../api/schemas"

type Args = {
  inWishlist: boolean
  gamePayload: ListGame
}

export default function useWishlistToggle(gameId: number, wishlist: List | undefined) {
  const qc = useQueryClient()
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: ({ inWishlist, gamePayload }: Args) => {
      if (!wishlist) throw new Error("Wishlist not found")
      if (inWishlist) return removeGamesFromList(wishlist.id, [gameId])
      return addGamesToList(wishlist.id, [gamePayload])
    },
    onSuccess: (_, { inWishlist, gamePayload }) => {
      qc.invalidateQueries(userGameQueryOptions(gameId))
      notifications.show({
        message: inWishlist ? "Removed from wishlist" : `"${gamePayload.name}" added to wishlist`,
        color: "green",
      })
    },
    onError: () => notifications.show({ message: "Failed to update wishlist", color: "red" }),
  })
  return { toggleWishlist: mutateAsync, isLoading: isPending, isError }
}

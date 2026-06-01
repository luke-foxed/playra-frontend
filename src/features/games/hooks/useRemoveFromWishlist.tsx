import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { removeGamesFromList, listsQueryOptions, listDetailQueryOptions } from "../../lists/api/lists"
import { userGameQueryOptions } from "../api/games"

export default function useRemoveFromWishlist(gameId: number) {
  const qc = useQueryClient()
  const { data: lists } = useQuery({ ...listsQueryOptions(), staleTime: 60_000 })
  const wishlist = lists?.find((l) => l.type === "wishlist")

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!wishlist) throw new Error("Wishlist not found")
      return removeGamesFromList(wishlist.id, [gameId])
    },
    onSuccess: () => {
      qc.invalidateQueries(userGameQueryOptions(gameId))
      if (wishlist) qc.invalidateQueries(listDetailQueryOptions(wishlist.id))
      notifications.show({ title: "Wishlist", message: "Removed from wishlist", color: "blue" })
    },
    onError: () => notifications.show({ title: "Error", message: "Failed to remove from wishlist", color: "red" }),
  })

  return { removeFromWishlist: mutate, isLoading: isPending }
}

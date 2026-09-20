import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { addGamesToList, listDetailQueryOptions, listsQueryOptions, removeGamesFromList } from "../api/lists"
import { userGameQueryOptions } from "../../games/api/games"
import type { ListDetail, ListGame } from "../api/schemas"

type Args = {
  inWishlist: boolean
  gamePayload: ListGame
}

export default function useWishlist(gameId: number) {
  const qc = useQueryClient()
  const { data: lists } = useQuery(listsQueryOptions())
  const wishlist = lists?.find((l) => l.type === "wishlist")

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ inWishlist, gamePayload }: Args) => {
      if (!wishlist) throw new Error("Wishlist not found")
      if (inWishlist) return removeGamesFromList(wishlist.id, [gameId])
      return addGamesToList(wishlist.id, [gamePayload])
    },
    onMutate: async ({ inWishlist, gamePayload }) => {
      if (!wishlist) return
      const key = listDetailQueryOptions(wishlist.id).queryKey
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<ListDetail>(key)
      qc.setQueryData<ListDetail>(key, (prev) => {
        if (!prev) return prev
        const games = inWishlist
          ? prev.games.filter((g) => g.game_id !== gameId)
          : [...prev.games, { ...gamePayload, added_at: new Date().toISOString() }]
        return { ...prev, games }
      })
      return { previous, key }
    },
    onSuccess: (_, { inWishlist }) => {
      notifications.show({
        title: "Wishlist",
        message: inWishlist ? "Removed from wishlist" : "Added to wishlist",
        color: "green",
      })
    },
    onError: (_, __, context) => {
      if (context?.previous) qc.setQueryData(context.key, context.previous)
      notifications.show({ title: "Error", message: "Failed to update wishlist", color: "red" })
    },
    onSettled: () => {
      qc.invalidateQueries(userGameQueryOptions(gameId))
      qc.invalidateQueries({ queryKey: ["lists"] })
      if (wishlist) qc.invalidateQueries(listDetailQueryOptions(wishlist.id))
    },
  })

  return { toggleWishlist: mutateAsync, isLoading: isPending }
}

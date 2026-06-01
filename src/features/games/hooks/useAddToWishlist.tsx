import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { addGamesToList, listsQueryOptions, listDetailQueryOptions } from "../../lists/api/lists"
import { userGameQueryOptions } from "../api/games"

type AddPayload = {
  game_id: number
  name: string
  released: string | null
  metacritic: number | null
  background_image: string | null
}

export default function useAddToWishlist(gameId: number) {
  const qc = useQueryClient()
  const { data: lists } = useQuery({ ...listsQueryOptions(), staleTime: 60_000 })
  const wishlist = lists?.find((l) => l.type === "wishlist")

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: AddPayload) => {
      if (!wishlist) throw new Error("Wishlist not found")
      return addGamesToList(wishlist.id, [{ ...payload, genres: [] }])
    },
    onSuccess: () => {
      qc.invalidateQueries(userGameQueryOptions(gameId))
      if (wishlist) qc.invalidateQueries(listDetailQueryOptions(wishlist.id))
      notifications.show({ title: "Wishlist", message: "Added to wishlist", color: "green" })
    },
    onError: () => notifications.show({ title: "Error", message: "Failed to add to wishlist", color: "red" }),
  })

  return { addToWishlist: mutate, isLoading: isPending }
}

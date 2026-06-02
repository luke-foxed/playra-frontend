import { useQuery } from "@tanstack/react-query"
import { listsQueryOptions, listDetailQueryOptions } from "../../lists/api/lists"

export function useUserLibrary() {
  const { data: lists } = useQuery({
    ...listsQueryOptions(),
    staleTime: Infinity,
  })

  const wishlist = lists?.find((l) => l.type === "wishlist")
  const ratingsList = lists?.find((l) => l.type === "ratings")

  const { data: wishlistDetail } = useQuery({
    ...listDetailQueryOptions(wishlist?.id ?? ""),
    enabled: !!wishlist?.id,
  })

  const { data: ratingsDetail } = useQuery({
    ...listDetailQueryOptions(ratingsList?.id ?? ""),
    enabled: !!ratingsList?.id,
  })

  const wishlistedIds = new Set(wishlistDetail?.games.map((g) => g.game_id) ?? [])
  const userRatings = new Map<number, number>(
    (ratingsDetail?.games ?? [])
      .filter((g) => g.user_rating != null)
      .map((g) => [g.game_id, g.user_rating!] as [number, number])
  )

  return { wishlistedIds, userRatings }
}

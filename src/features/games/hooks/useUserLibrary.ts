import { useQuery } from "@tanstack/react-query"
import { listsQueryOptions, listDetailQueryOptions } from "../../lists/api/lists"

export function useUserLibrary() {
  const { data: lists } = useQuery({
    ...listsQueryOptions(),
    staleTime: Infinity,
  })

  const wishlist = lists?.find((l) => l.type === "wishlist")

  const { data: wishlistDetail } = useQuery({
    ...listDetailQueryOptions(wishlist?.id ?? ""),
    enabled: !!wishlist?.id,
  })

  const wishlistedIds = new Set(wishlistDetail?.games.map((g) => g.game_id) ?? [])

  return { wishlistedIds }
}

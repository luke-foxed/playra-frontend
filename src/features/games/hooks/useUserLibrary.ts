import { skipToken, useQuery } from "@tanstack/react-query"
import { listsQueryOptions, listDetailQueryOptions, getList } from "../../lists/api/lists"

export function useUserLibrary() {
  const { data: lists } = useQuery(listsQueryOptions())

  const wishlistId = lists?.find((l) => l.type === "wishlist")?.id
  const ratingsId = lists?.find((l) => l.type === "ratings")?.id

  const { data: wishlistDetail } = useQuery({
    ...listDetailQueryOptions(wishlistId ?? ""),
    queryFn: wishlistId ? () => getList(wishlistId) : skipToken,
  })
  const { data: ratingsDetail } = useQuery({
    ...listDetailQueryOptions(ratingsId ?? ""),
    queryFn: ratingsId ? () => getList(ratingsId) : skipToken,
  })

  const wishlistedIds = new Set(wishlistDetail?.games.map((g) => g.game_id) ?? [])
  const userRatings = new Map<number, number>(
    (ratingsDetail?.games ?? []).flatMap((g): [number, number][] => (g.user_rating != null ? [[g.game_id, g.user_rating]] : [])),
  )

  return { wishlistedIds, userRatings }
}

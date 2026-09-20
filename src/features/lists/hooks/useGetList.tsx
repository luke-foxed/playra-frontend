import { skipToken, useQuery } from "@tanstack/react-query"
import { getList, listDetailQueryOptions } from "../api/lists"

export default function useGetList(listId: string | null) {
  return useQuery({
    ...listDetailQueryOptions(listId ?? ""),
    queryFn: listId === null ? skipToken : () => getList(listId),
  })
}

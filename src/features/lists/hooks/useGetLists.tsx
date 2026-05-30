import { useQuery } from "@tanstack/react-query"
import { getLists } from "../api/lists"

export default function useGetLists(userId?: string, enabled = true) {
  return useQuery({
    queryKey: ["lists", userId ?? "self"],
    queryFn: () => getLists(userId ? { user_id: userId } : undefined),
    enabled,
  })
}

import { useQuery } from "@tanstack/react-query"
import { listsQueryOptions } from "../api/lists"

export default function useGetLists(userId?: string, enabled = true) {
  return useQuery({ ...listsQueryOptions(userId), enabled })
}

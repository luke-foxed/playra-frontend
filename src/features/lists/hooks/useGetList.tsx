import { useQuery } from "@tanstack/react-query"
import { getList } from "../api/lists"

export default function useGetList(listId: string | null) {
  return useQuery({
    queryKey: ["list", listId],
    queryFn: () => getList(listId!),
    enabled: listId !== null,
  })
}

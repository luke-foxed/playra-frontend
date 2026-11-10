import { useQuery } from "@tanstack/react-query"
import { getPlatforms } from "../api/platforms"

export default function useGetPlatforms() {
  return useQuery({
    queryKey: ["platforms"],
    queryFn: getPlatforms,
    staleTime: Infinity,
    enabled: false,
  })
}

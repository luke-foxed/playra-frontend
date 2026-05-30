import { useQuery } from "@tanstack/react-query"
import supabase from "../../../lib/supabase_client"
import { getProfile } from "../../profile/api/profile"

export default function useGetAuth(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      try {
        return await getProfile(userId!)
      } catch {
        await supabase.auth.signOut()
        return null
      }
    },
    enabled: !!userId,
  })
}

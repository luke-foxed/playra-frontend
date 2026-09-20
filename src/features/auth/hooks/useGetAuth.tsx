import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import supabase from "../../../lib/supabase_client"
import { getProfile, profileQueryOptions } from "../../profile/api/profile"

const INVALID_PROFILE_STATUSES = [401, 403, 404]

export default function useGetAuth(userId: string | undefined) {
  return useQuery({
    ...profileQueryOptions(userId ?? ""),
    queryFn: async () => {
      try {
        return await getProfile(userId!)
      } catch (error) {
        // only drop the session when the profile is definitively gone/forbidden, not on network/5xx
        if (isAxiosError(error) && INVALID_PROFILE_STATUSES.includes(error.response?.status ?? 0)) {
          await supabase.auth.signOut()
        }
        throw error
      }
    },
    enabled: !!userId,
  })
}

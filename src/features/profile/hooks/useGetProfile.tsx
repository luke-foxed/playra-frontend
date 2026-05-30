import { useContext } from "react"
import { AuthContext } from "../../auth/providers/auth_provider"

export default function useGetProfile() {
  const { profile } = useContext(AuthContext)
  return profile
}
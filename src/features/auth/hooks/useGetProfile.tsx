import { useContext } from "react"
import { AuthContext } from "../providers/auth_provider"

export default function useGetProfile() {
  const { profile } = useContext(AuthContext)
  return profile
}
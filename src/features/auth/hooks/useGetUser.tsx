import { useContext } from "react"
import { AuthContext } from "../providers/auth_provider"

export default function useGetUser() {
  const { user } = useContext(AuthContext)
  return user
}

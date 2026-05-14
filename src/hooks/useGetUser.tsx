import { useContext } from "react";
import { AuthContext } from "../providers/auth_provider";

export default function useGetUser() {
  const { user, session } = useContext(AuthContext)
  console.log("useGetUser session:", session)
  console.log("useGetUser user:", user)
  return user
}
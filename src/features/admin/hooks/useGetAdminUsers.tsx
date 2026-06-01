import { useQuery } from "@tanstack/react-query"
import { adminUsersQueryOptions } from "../api/admin"

export default function useGetAdminUsers() {
  return useQuery(adminUsersQueryOptions())
}

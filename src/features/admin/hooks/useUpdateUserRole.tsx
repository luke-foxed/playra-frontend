import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { adminUsersQueryOptions, updateUserRole } from "../api/admin"
import type { AdminUser, UserRole } from "../api/schemas"

export default function useUpdateUserRole() {
  const qc = useQueryClient()
  const queryKey = adminUsersQueryOptions().queryKey

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => updateUserRole(userId, role),
    onMutate: async ({ userId, role }) => {
      await qc.cancelQueries({ queryKey })
      const previous = qc.getQueryData<AdminUser[]>(queryKey)
      qc.setQueryData<AdminUser[]>(queryKey, (users) => users?.map((u) => (u.id === userId ? { ...u, role } : u)))
      return { previous }
    },
    onSuccess: (_, { role }) => notifications.show({ title: "Role updated", message: `Now ${role}`, color: "green" }),
    onError: (_, __, context) => {
      if (context?.previous) qc.setQueryData(queryKey, context.previous)
      notifications.show({ title: "Error", message: "Failed to update role", color: "red" })
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  })
}

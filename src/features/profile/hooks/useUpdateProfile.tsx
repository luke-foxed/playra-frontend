import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { profileQueryOptions, updateProfile } from "../api/profile"

type Values = { username: string; avatar_url: string | null }

export default function useUpdateProfile(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: Values) => updateProfile(userId, values),
    onSuccess: () => {
      // same key the auth provider reads, so the navbar avatar refreshes too
      qc.invalidateQueries(profileQueryOptions(userId))
      notifications.show({ title: "Profile updated", message: "Your changes have been saved", color: "green" })
    },
    onError: () => notifications.show({ title: "Error", message: "Failed to update profile", color: "red" }),
  })
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"
import { createList, listsQueryOptions } from "../api/lists"
import type { CreateListInput } from "../api/schemas"

export default function useCreateList(profileUserId: string) {
  const qc = useQueryClient()
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (input: CreateListInput) => createList(input),
    onSuccess: (list) => {
      qc.invalidateQueries(listsQueryOptions(profileUserId))
      notifications.show({ title: "List created", message: `"${list.name}" is ready`, color: "green" })
    },
    onError: () => notifications.show({ title: "Error", message: "Failed to create list", color: "red" }),
  })
  return { createList: mutateAsync, isLoading: isPending, isError }
}

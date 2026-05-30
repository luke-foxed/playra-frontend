import { createFileRoute } from "@tanstack/react-router"
import { Avatar, Button, Divider, Loader, Stack, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useContext } from "react"
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { profileQueryOptions, updateProfile } from "../../features/profile/api/profile"
import routeProtector from "../../lib/route_protector"
import { AuthContext } from "../../features/auth/providers/auth_provider"
import ListPanel from "../../features/lists/components/list_panel"

export const Route = createFileRoute("/profile/$id")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(profileQueryOptions(params.id)),
  pendingComponent: () => <Loader />,
})

function RouteComponent() {
  const params = Route.useParams()
  const qc = useQueryClient()
  const { profile: currentUserProfile } = useContext(AuthContext)

  const { data: profile } = useSuspenseQuery(profileQueryOptions(params.id))

  const form = useForm({
    initialValues: {
      username: profile.username,
      avatar_url: profile.avatar_url ?? "",
    },
  })

  async function handleSubmit(values: typeof form.values) {
    await updateProfile(params.id, {
      username: values.username,
      avatar_url: values.avatar_url || null,
    })
    qc.invalidateQueries(profileQueryOptions(params.id))
  }

  return (
    <Stack p="md" maw={900}>
      <Stack maw={480}>
        <Title order={2}>{profile.username}</Title>
        <Avatar src={form.values.avatar_url || null} size="xl" radius="xl" />
        {currentUserProfile?.id === params.id && (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="sm">
              <TextInput label="Avatar URL" placeholder="https://..." {...form.getInputProps("avatar_url")} />
              <TextInput label="Username" placeholder="Username" {...form.getInputProps("username")} />
              <Button type="submit" variant="light">Save</Button>
            </Stack>
          </form>
        )}
      </Stack>

      <Divider mt="md" />

      <ListPanel
        profileUserId={params.id}
        currentUserId={currentUserProfile?.id ?? null}
      />
    </Stack>
  )
}

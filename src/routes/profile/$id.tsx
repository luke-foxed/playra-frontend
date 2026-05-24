import { createFileRoute } from "@tanstack/react-router"
import { Avatar, Button, Loader, Stack, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { getProfile, updateProfile } from "../../features/auth/api/profile"
import routeProtector from "../../lib/route_protector"

export const Route = createFileRoute("/profile/$id")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: ({ params }) => getProfile(params.id),
  pendingComponent: () => <Loader />,
})

function RouteComponent() {
  const profile = Route.useLoaderData()
  const params = Route.useParams()

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
  }

  return (
    <Stack p="md" maw={480}>
      <Title order={2}>Profile</Title>
      <Avatar src={form.values.avatar_url || null} size="xl" radius="xl" />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput label="Avatar URL" placeholder="https://..." {...form.getInputProps("avatar_url")} />
          <TextInput label="Username" placeholder="Username" {...form.getInputProps("username")} />
          <Button type="submit">Save</Button>
        </Stack>
      </form>
    </Stack>
  )
}

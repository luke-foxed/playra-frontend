import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { Alert, Button, Center, Stack, Text } from "@mantine/core"

const RestrictedSearchSchema = z.object({
  role: z.enum(["pending", "suspended"]).catch("pending"),
})

export const Route = createFileRoute("/restricted/")({
  component: RouteComponent,
  validateSearch: RestrictedSearchSchema.parse,
})

const content = {
  pending: {
    title: "Account Pending",
    message: "Your account is awaiting approval. You'll be notified once it's been reviewed.",
    color: "yellow",
  },
  suspended: {
    title: "Account Suspended",
    message: "Your account has been suspended. Please contact support if you believe this is an error.",
    color: "red",
  },
}

function RouteComponent() {
  const { role } = Route.useSearch()
  const { title, message, color } = content[role]

  return (
    <Center h="60vh">
      <Stack align="center" maw={480} gap="md">
        <Alert color={color} title={title} w="100%">
          <Text>{message}</Text>
        </Alert>
        <Button variant="subtle" component="a" href="/login">
          Back to login
        </Button>
      </Stack>
    </Center>
  )
}

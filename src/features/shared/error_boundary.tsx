import { useRouter } from "@tanstack/react-router"
import { Alert, Button, Center, MantineProvider, Stack } from "@mantine/core"
import { isAxiosError } from "axios"
import { theme } from "../../theme"

function getErrorContent(error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status === 403) return { title: "Access Denied", message: "You don't have permission to view this page.", color: "red" }
    if (status === 404) return { title: "Not Found", message: "The page or resource you requested doesn't exist.", color: "gray" }
    if (status === 401) return { title: "Unauthorised", message: "You need to be logged in to view this page.", color: "orange" }
  }
  return { title: "Something went wrong", message: "An unexpected error occurred.", color: "red" }
}

export default function ErrorBoundary({ error }: { error: unknown }) {
  const router = useRouter()
  const { title, message, color } = getErrorContent(error)

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark" withGlobalClasses>
      <Center h="60vh">
        <Stack align="center" maw={480} gap="md">
          <Alert color={color} title={title} w="100%">{message}</Alert>
          <Button variant="subtle" onClick={() => router.history.back()}>Go back</Button>
        </Stack>
      </Center>
    </MantineProvider>
  )
}

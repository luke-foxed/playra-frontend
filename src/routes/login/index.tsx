import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { useState } from 'react'
import { Box, Title, Text, TextInput, PasswordInput, Button, Anchor, Paper, Center, Stack, Alert } from '@mantine/core'
import useLogin from '../../features/auth/hooks/useLogin'
import Logo from '../../features/shared/logo'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  validateSearch: z.object({ redirect: z.string().optional() }).parse,
})

function RouteComponent() {
  const { mutateAsync: login, isPending } = useLogin()
  const { redirect: redirectTo } = Route.useSearch()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await login({ email: form.get('email') as string, password: form.get('password') as string })
      router.history.push(redirectTo ?? '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <Center style={{ minHeight: '80vh' }} p="xl">
      <Stack align="center" gap="xl" w="100%" maw={420}>
        <Stack align="center" gap={10}>
          <Logo size={52} />
          <Text fw={700} fz={26} style={{ letterSpacing: -0.8 }} c="dark.0">playra</Text>
        </Stack>

        <Paper w="100%" p="xl" radius="lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
          <Title order={2} mb={6} style={{ fontWeight: 800, letterSpacing: -0.6 }}>Welcome back</Title>
          <Text fz="sm" c="dark.2" mb="xl">Log in to your Playra account.</Text>
          <form onSubmit={handleSubmit}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <TextInput label="Email" type="email" name="email" placeholder="you@example.com" required radius="md" />
              <PasswordInput label="Password" name="password" placeholder="••••••••" required radius="md" />
              {error && <Alert color="red" radius="md" fz="sm">{error}</Alert>}
              <Button type="submit" fullWidth mt={6} loading={isPending}>Log in</Button>
            </Box>
          </form>
          <Text ta="center" fz="sm" c="dark.2" mt="lg">
            No account?{' '}
            <Anchor component={Link} to="/signup" c="violet">Sign up</Anchor>
          </Text>
        </Paper>
      </Stack>
    </Center>
  )
}

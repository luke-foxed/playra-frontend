import { createFileRoute, Link } from '@tanstack/react-router'
import { Box, Title, Text, TextInput, PasswordInput, Button, Anchor, Paper, Center } from '@mantine/core'
import useLogin from '../../features/auth/hooks/useLogin'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync: login } = useLogin()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await login({ email: form.get('email') as string, password: form.get('password') as string })
  }

  return (
    <Center style={{ minHeight: 'calc(100vh - 68px)' }} p="xl">
      <Paper w="100%" maw={420} p="xl" radius="lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
        <Title order={2} mb={6} style={{ fontWeight: 800, letterSpacing: -0.6 }}>Welcome back</Title>
        <Text fz="sm" c="dark.2" mb="xl">Log in to your Playra account.</Text>
        <form onSubmit={handleSubmit}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TextInput label="Email" type="email" name="email" placeholder="you@example.com" required radius="md" />
            <PasswordInput label="Password" name="password" placeholder="••••••••" required radius="md" />
            <Button type="submit" fullWidth mt={6}>Log in</Button>
          </Box>
        </form>
        <Text ta="center" fz="sm" c="dark.2" mt="lg">
          No account?{' '}
          <Anchor component={Link} to="/signup" c="violet">Sign up</Anchor>
        </Text>
      </Paper>
    </Center>
  )
}

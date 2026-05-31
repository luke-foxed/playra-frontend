import { createFileRoute, Link } from '@tanstack/react-router'
import { Box, Title, Text, TextInput, PasswordInput, Button, Anchor, Paper, Center } from '@mantine/core'
import useSignup from '../../features/auth/hooks/useSignup'

export const Route = createFileRoute('/signup/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync: signup } = useSignup()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = form.get('password') as string
    if (password !== form.get('confirmPassword')) return
    await signup({ email: form.get('email') as string, password })
  }

  return (
    <Center style={{ minHeight: 'calc(100vh - 68px)' }} p="xl">
      <Paper w="100%" maw={420} p="xl" radius="lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
        <Title order={2} mb={6} style={{ fontWeight: 800, letterSpacing: -0.6 }}>Create account</Title>
        <Text fz="sm" c="dark.2" mb="xl">Join Playra and start tracking your games.</Text>
        <form onSubmit={handleSubmit}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TextInput label="Email" type="email" name="email" placeholder="you@example.com" required radius="md" />
            <PasswordInput label="Password" name="password" placeholder="••••••••" required radius="md" />
            <PasswordInput label="Confirm password" name="confirmPassword" placeholder="••••••••" required radius="md" />
            <Button type="submit" fullWidth mt={6}>Sign up</Button>
          </Box>
        </form>
        <Text ta="center" fz="sm" c="dark.2" mt="lg">
          Already have an account?{' '}
          <Anchor component={Link} to="/login" c="violet">Log in</Anchor>
        </Text>
      </Paper>
    </Center>
  )
}

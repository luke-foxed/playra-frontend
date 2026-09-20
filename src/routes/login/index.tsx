import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { useState } from 'react'
import { TextInput, PasswordInput, Button, Anchor, Stack, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import useLogin from '../../features/auth/hooks/useLogin'
import AuthShell from '../../features/auth/components/auth_shell'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  validateSearch: z.object({ redirect: z.string().optional() }).parse,
})

// only allow same-origin relative paths (blocks //evil.com and https://...)
const safeRedirect = (to?: string) => (to && /^\/(?![/\\])/.test(to) ? to : '/')

function RouteComponent() {
  const { mutateAsync: login, isPending } = useLogin()
  const { redirect: redirectTo } = Route.useSearch()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email'),
      password: (v) => (v ? null : 'Password is required'),
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setError(null)
    try {
      await login(values)
      router.history.push(safeRedirect(redirectTo))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your Playra account."
      footer={<>No account? <Anchor component={Link} to="/signup" c="violet">Sign up</Anchor></>}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap={14}>
          <TextInput label="Email" type="email" placeholder="you@example.com" radius="md" {...form.getInputProps('email')} />
          <PasswordInput label="Password" placeholder="••••••••" radius="md" {...form.getInputProps('password')} />
          {error && <Alert color="red" radius="md" fz="sm">{error}</Alert>}
          <Button type="submit" fullWidth mt={6} loading={isPending}>Log in</Button>
        </Stack>
      </form>
    </AuthShell>
  )
}

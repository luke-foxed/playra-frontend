import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Box, Title, Text, TextInput, PasswordInput, Button, Anchor, Paper, Center, Stack, Progress } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { notifications } from '@mantine/notifications'
import useSignup from '../../features/auth/hooks/useSignup'
import Logo from '../../features/shared/logo'

export const Route = createFileRoute('/signup/')({
  component: RouteComponent,
})

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'gray' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score: 20, label: 'Weak', color: 'red' }
  if (score === 2) return { score: 40, label: 'Fair', color: 'orange' }
  if (score === 3) return { score: 65, label: 'Good', color: 'yellow' }
  if (score === 4) return { score: 85, label: 'Strong', color: 'teal' }
  return { score: 100, label: 'Very strong', color: 'green' }
}

function RouteComponent() {
  const { mutateAsync: signup, isPending } = useSignup()
  const router = useRouter()
  const [pwValue, setPwValue] = useState('')

  const form = useForm({
    initialValues: { username: '', email: '', password: '', confirmPassword: '' },
    validate: {
      username: (v) => {
        if (!v.trim()) return 'Username is required'
        if (v.length < 3) return 'At least 3 characters'
        if (v.length > 20) return 'Max 20 characters'
        if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Letters, numbers and underscores only'
        return null
      },
      email: (v) => {
        if (!v.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email'
        return null
      },
      password: (v) => {
        if (!v) return 'Password is required'
        if (v.length < 8) return 'At least 8 characters'
        return null
      },
      confirmPassword: (v, vals) =>
        v !== vals.password ? 'Passwords do not match' : null,
    },
    validateInputOnChange: ['confirmPassword'],
  })

  const strength = passwordStrength(pwValue)

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await signup({ email: values.email, password: values.password, username: values.username })
      router.history.push('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed'
      notifications.show({ title: 'Signup failed', message: msg, color: 'red' })
    }
  }

  return (
    <Center style={{ minHeight: '100dvh' }} p="xl">
      <Stack align="center" gap="xl" w="100%" maw={420}>
        <Stack align="center" gap={10}>
          <Logo size={52} />
          <Text fw={700} fz={26} style={{ letterSpacing: -0.8 }} c="dark.0">playra</Text>
        </Stack>

        <Paper w="100%" p="xl" radius="lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
          <Title order={2} mb={6} style={{ fontWeight: 800, letterSpacing: -0.6 }}>Create account</Title>
          <Text fz="sm" c="dark.2" mb="xl">Join Playra and start tracking your games.</Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap={14}>
              <TextInput
                label="Username"
                placeholder="coolplayer99"
                radius="md"
                {...form.getInputProps('username')}
              />
              <TextInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                radius="md"
                {...form.getInputProps('email')}
              />
              <Box>
                <PasswordInput
                  label="Password"
                  placeholder="••••••••"
                  radius="md"
                  {...form.getInputProps('password')}
                  onChange={(e) => {
                    setPwValue(e.currentTarget.value)
                    form.getInputProps('password').onChange(e)
                  }}
                />
                {pwValue && (
                  <Box mt={8}>
                    <Progress
                      value={strength.score}
                      color={strength.color}
                      size={3}
                      radius="xl"
                      style={{ transition: 'all 0.2s' }}
                    />
                    <Text fz={11} c={strength.color} mt={4} fw={500}>{strength.label}</Text>
                  </Box>
                )}
              </Box>
              <PasswordInput
                label="Confirm password"
                placeholder="••••••••"
                radius="md"
                {...form.getInputProps('confirmPassword')}
              />
              <Button type="submit" fullWidth mt={6} loading={isPending}>
                Sign up
              </Button>
            </Stack>
          </form>

          <Text ta="center" fz="sm" c="dark.2" mt="lg">
            Already have an account?{' '}
            <Anchor component={Link} to="/login" c="violet">Log in</Anchor>
          </Text>
        </Paper>
      </Stack>
    </Center>
  )
}

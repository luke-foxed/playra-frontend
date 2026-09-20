import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { TextInput, PasswordInput, Button, Anchor, Stack, Progress, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import useSignup from '../../features/auth/hooks/useSignup'
import AuthShell from '../../features/auth/components/auth_shell'

export const Route = createFileRoute('/signup/')({
  component: RouteComponent,
})

function passwordStrength(pw: string) {
  const score = [pw.length >= 8, pw.length >= 12, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length
  if (score <= 1) return { value: 20, label: 'Weak', color: 'red' }
  if (score === 2) return { value: 40, label: 'Fair', color: 'orange' }
  if (score === 3) return { value: 65, label: 'Good', color: 'yellow' }
  if (score === 4) return { value: 85, label: 'Strong', color: 'teal' }
  return { value: 100, label: 'Very strong', color: 'green' }
}

function RouteComponent() {
  const { mutateAsync: signup, isPending } = useSignup()
  const router = useRouter()

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
      confirmPassword: (v, vals) => (v !== vals.password ? 'Passwords do not match' : null),
    },
    validateInputOnChange: ['confirmPassword'],
  })

  form.watch('password', () => {
    if (form.isTouched('confirmPassword')) form.validateField('confirmPassword')
  })

  const strength = passwordStrength(form.values.password)

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
    <AuthShell
      title="Create account"
      subtitle="Join Playra and start tracking your games."
      footer={<>Already have an account? <Anchor component={Link} to="/login" c="violet">Log in</Anchor></>}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap={14}>
          <TextInput label="Username" placeholder="coolplayer99" radius="md" {...form.getInputProps('username')} />
          <TextInput label="Email" type="email" placeholder="you@example.com" radius="md" {...form.getInputProps('email')} />
          <div>
            <PasswordInput label="Password" placeholder="••••••••" radius="md" {...form.getInputProps('password')} />
            {form.values.password && (
              <div>
                <Progress mt={8} value={strength.value} color={strength.color} size={3} radius="xl" transitionDuration={200} />
                <Text fz={11} c={strength.color} mt={4} fw={500}>{strength.label}</Text>
              </div>
            )}
          </div>
          <PasswordInput label="Confirm password" placeholder="••••••••" radius="md" {...form.getInputProps('confirmPassword')} />
          <Button type="submit" fullWidth mt={6} loading={isPending}>Sign up</Button>
        </Stack>
      </form>
    </AuthShell>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import useLogin from '../../features/auth/hooks/useLogin'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync: login } = useLogin()
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string

    await login({ email: form.get("email") as string, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Log in</button>
    </form>
  )
}

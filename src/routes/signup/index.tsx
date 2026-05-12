import { createFileRoute } from "@tanstack/react-router"
import useSignup from "../../hooks/useSignup"

export const Route = createFileRoute("/signup/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync } = useSignup()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string
    const confirmPassword = form.get("confirmPassword") as string

    if (password !== confirmPassword) return

    await mutateAsync({ email: form.get("email") as string, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='email'
        name='email'
        placeholder='Email'
        required
      />
      <input
        type='password'
        name='password'
        placeholder='Password'
        required
      />
      <input
        type='password'
        name='confirmPassword'
        placeholder='Confirm password'
        required
      />
      <button type='submit'>Sign up</button>
    </form>
  )
}

import { createFileRoute } from "@tanstack/react-router"
import useSignup from "../../features/auth/hooks/useSignup"

export const Route = createFileRoute("/signup/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync: signup } = useSignup()

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string
    const confirmPassword = form.get("confirmPassword") as string

    if (password !== confirmPassword) return

    await signup({ email: form.get("email") as string, password })
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

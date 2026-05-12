import { useMutation } from "@tanstack/react-query"
import supabase from "../lib/supabase_client"

type SignupProps = {
  email: string
  password: string
}

async function signup({ email, password }: SignupProps) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export default function useSignup() {
  return useMutation({ mutationFn: signup, onSuccess: ({ user }) => console.log(user) })
}

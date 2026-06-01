import { useMutation } from "@tanstack/react-query"
import supabase from "../../../lib/supabase_client"

type SignupProps = {
  email: string
  password: string
  username: string
}

async function signup({ email, password, username }: SignupProps) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })
  if (error) throw error
  return data
}

export default function useSignup() {
  return useMutation({ mutationFn: signup })
}

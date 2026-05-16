import { useMutation } from "@tanstack/react-query"
import supabase from "../../../lib/supabase_client"

type LoginProps = {
  email: string
  password: string
}

async function login({ email, password }: LoginProps) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export default function useLogin() {
  return useMutation({ mutationFn: login })
}

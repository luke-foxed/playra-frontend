import type { AuthSession } from "@supabase/supabase-js"
import { createContext, useEffect, useState } from "react"
import supabase from "../../../lib/supabase_client"
import type { Profile } from "../../profile/api/schema"
import useGetAuth from "../hooks/useGetAuth"

export const AuthContext = createContext({
  session: null as AuthSession | null,
  profile: null as Profile | null,
  loading: true,
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setSession(null)
      } else if (session) {
        setSession(session)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const { data: profile = null, isLoading: profileLoading } = useGetAuth(session?.user?.id)

  return (
    <AuthContext.Provider value={{ session, profile, loading: sessionLoading || profileLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

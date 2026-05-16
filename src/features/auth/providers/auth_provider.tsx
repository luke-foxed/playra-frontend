import type { AuthSession, User } from "@supabase/supabase-js"
import { createContext, useEffect, useState } from "react"
import supabase from "../../../lib/supabase_client"

export const AuthContext = createContext({
  session: null as AuthSession | null,
  user: null as User | null,
  loading: true,
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
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
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user || null, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

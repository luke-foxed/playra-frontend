import { createClient } from "@supabase/supabase-js"
import type { AuthSession } from "@supabase/supabase-js"
import { createContext, useEffect, useState } from "react"

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)

const AuthContext = createContext({
  session: null as AuthSession | null,
  getUser: async () => supabase.auth.getUser(),
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
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

  console.log("AuthProvider session:", session)


  return (
    <AuthContext.Provider value={{ session, getUser: async () => supabase.auth.getUser() }}>
      {children}
    </AuthContext.Provider>
  )
}

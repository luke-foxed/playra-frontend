import { getProfile } from "../features/profile/api/profile"
import supabase from "./supabase_client"
import { redirect, isRedirect } from "@tanstack/react-router"

export default async function routeProtector({ location }: { location: { href: string } }) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    throw redirect({
      to: "/login",
      search: { redirect: location.href },
    })
  }

  try {
    const profile = await getProfile(session.user.id)

    if (profile.role !== "active" && profile.role !== "admin") {
      throw redirect({
        to: "/restricted",
        search: { role: profile.role as "pending" | "suspended" },
      })
    }
  } catch (error) {
    if (isRedirect(error)) throw error
    // profile fetch failed (network/server error) — don't kick logged-in user
  }

  return session.user
}

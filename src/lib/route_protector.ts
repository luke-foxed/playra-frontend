import type { QueryClient } from "@tanstack/react-query"
import { redirect, isRedirect } from "@tanstack/react-router"
import { profileQueryOptions } from "../features/profile/api/profile"
import supabase from "./supabase_client"

type GuardArgs = {
  location: { href: string }
  context: { queryClient: QueryClient }
}

async function requireSession(location: GuardArgs["location"]) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw redirect({ to: "/login", search: { redirect: location.href } })
  }
  return session.user
}

const loadProfile = (queryClient: QueryClient, userId: string) =>
  queryClient.ensureQueryData({ ...profileQueryOptions(userId), revalidateIfStale: true })

export default async function routeProtector({ location, context }: GuardArgs) {
  const user = await requireSession(location)

  try {
    const profile = await loadProfile(context.queryClient, user.id)

    if (profile.role !== "active" && profile.role !== "admin") {
      throw redirect({
        to: "/restricted",
        search: { role: profile.role === "suspended" ? "suspended" : "pending" },
      })
    }
  } catch (error) {
    if (isRedirect(error)) throw error
    // profile fetch failed (network/server error) — don't kick logged-in user
  }

  return user
}

// Admin-only routes. Fails closed: if the profile can't be loaded, send the user home.
// (The API must still enforce admin access; this is only UX.)
export async function adminGuard({ location, context }: GuardArgs) {
  const user = await requireSession(location)

  try {
    const profile = await loadProfile(context.queryClient, user.id)
    if (profile.role !== "admin") throw redirect({ to: "/" })
  } catch (error) {
    if (isRedirect(error)) throw error
    throw redirect({ to: "/" })
  }

  return user
}

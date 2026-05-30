import { getProfile } from "../features/profile/api/profile"
import supabase from "./supabase_client"
import { redirect, isRedirect } from "@tanstack/react-router"

export default async function routeProtector({ location }: { location: { href: string } }) {
  try {
    const authUser = await supabase.auth.getUser()

    if (!authUser.data.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }

    const profile = await getProfile(authUser.data.user.id)

    if (profile.role !== "active" && profile.role !== "admin") {
      throw redirect({
        to: "/restricted",
        search: { role: profile.role as "pending" | "suspended" },
      })
    }

    return authUser.data.user
  } catch (error) {

    if (isRedirect(error)) throw error

    throw redirect({
      to: "/login",
      search: { redirect: location.href },
    })
  }
}

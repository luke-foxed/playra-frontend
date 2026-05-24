import { getProfile } from "../features/auth/api/profile"
import supabase from "./supabase_client"
import { redirect, isRedirect } from "@tanstack/react-router"

export default async function routeProtector({ location }: { location: { href: string } }) {
  try {
    const authUser = await supabase.auth.getUser()

    console.log("authUser", authUser)

    if (!authUser.data.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }

    const profile = await getProfile(authUser.data.user.id)

    console.log("profile", profile)

    if (profile.role !== "active" && profile.role !== "admin") {
      throw redirect({
        to: "/restricted",
        search: { role: profile.role as "pending" | "suspended" },
      })
    }

    return authUser.data.user
  } catch (error) {

    console.error("Route protector error:", error)

    if (isRedirect(error)) throw error

    throw redirect({
      to: "/login",
      search: { redirect: location.href },
    })
  }
}

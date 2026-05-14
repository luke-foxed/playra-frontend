import axios from "axios"
import supabase from "./supabase_client"

const apiClient = axios.create({
  baseURL: new URL(import.meta.env.VITE_API_URL).pathname,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(async (config) => {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.warn("Failed to get session:", error.message)
    return config
  }

  const token = data.session?.access_token

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default apiClient
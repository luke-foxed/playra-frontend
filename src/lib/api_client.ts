import axios from "axios"
import supabase from "./supabase_client"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(async (config) => {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
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
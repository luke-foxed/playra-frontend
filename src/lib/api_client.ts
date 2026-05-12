import axios from "axios"
import supabase from "./supabase_client"

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API })

apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

export default apiClient

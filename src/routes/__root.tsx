import { Outlet, createRootRoute, Link } from "@tanstack/react-router"
import AuthProvider from "../providers/auth_provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import useGetUser from "../hooks/useGetUser"
import supabase from "../lib/supabase_client"

export const Route = createRootRoute({
  component: RootComponent,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnMount: false },
  },
})

function Nav() {
  const user = useGetUser()
  return (
    <nav>
      <Link to='/'>Home</Link>
      <Link to='/login'>Login</Link>
      <Link to='/signup'>Signup</Link>
      <Link to='/games'>Games</Link>
      {user && <button onClick={() => supabase.auth.signOut()}>Logout</button>}
    </nav>
  )
}

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Nav />
        <hr />
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  )
}

import { Outlet, createRootRoute, Link } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MantineProvider } from '@mantine/core';
import AuthProvider from "../features/auth/providers/auth_provider"
import useGetUser from "../features/auth/hooks/useGetUser"
import supabase from "../lib/supabase_client"
import '@mantine/core/styles.css';

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
      <Link to='/games' search={{ page: 1, page_size: 20 }}>Games</Link>
      {user && <button onClick={() => supabase.auth.signOut()}>Logout</button>}
    </nav>
  )
}

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MantineProvider>
          <Nav />
          <hr />
          <Outlet />
        </MantineProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

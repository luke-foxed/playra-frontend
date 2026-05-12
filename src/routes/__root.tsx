import { Outlet, createRootRoute, Link } from "@tanstack/react-router"
import AuthProvider from "../providers/auth_provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export const Route = createRootRoute({
  component: RootComponent,
})

const queryClient = new QueryClient()

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <nav>
          <Link to='/'>Home</Link>
          <Link to='/login'>Login</Link>
          <Link to='/signup'>Signup</Link>
        </nav>

        <hr />

        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  )
}

import { Outlet, createRootRoute } from "@tanstack/react-router"
import ErrorBoundary from "../features/shared/error_boundary"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MantineProvider } from '@mantine/core';
import AuthProvider from "../features/auth/providers/auth_provider"
import '@mantine/core/styles.css';
import Navbar from "../features/shared/navbar";

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ({ error }) => <ErrorBoundary error={error} />,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnMount: false },
  },
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MantineProvider>
          <Navbar />
          <hr />
          <Outlet />
        </MantineProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import ErrorBoundary from "../features/shared/error_boundary"
import type { QueryClient } from "@tanstack/react-query"
import { QueryClientProvider } from "@tanstack/react-query"
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import AuthProvider from "../features/auth/providers/auth_provider"
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import Navbar from "../features/shared/navbar";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  errorComponent: ({ error }) => <ErrorBoundary error={error} />,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MantineProvider>
          <Notifications />
          <Navbar />
          <hr />
          <Outlet />
        </MantineProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

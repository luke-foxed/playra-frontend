import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import ErrorBoundary from '../features/shared/error_boundary'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, AppShell } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import AuthProvider from '../features/auth/providers/auth_provider'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '../styles/overrides.css'
import Navbar from '../features/shared/navbar'
import { theme } from '../theme'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  errorComponent: ({ error }) => <ErrorBoundary error={error} />,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MantineProvider theme={theme} defaultColorScheme="dark" withGlobalClasses>
          <Notifications position="bottom-center" />
          <AppShell header={{ height: 68 }} padding={0}>
            <AppShell.Header
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                background: 'color-mix(in oklab, var(--mantine-color-dark-7) 82%, transparent)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Navbar />
            </AppShell.Header>
            <AppShell.Main>
              <Outlet />
            </AppShell.Main>
          </AppShell>
        </MantineProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

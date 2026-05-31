import { Outlet, createRootRouteWithContext, useRouterState } from '@tanstack/react-router'
import { useContext, useEffect, useState } from 'react'
import ErrorBoundary from '../features/shared/error_boundary'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider, useIsFetching } from '@tanstack/react-query'
import { MantineProvider, AppShell } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import AuthProvider, { AuthContext } from '../features/auth/providers/auth_provider'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '../styles/overrides.css'
import '../styles/loader.css'
import Navbar from '../features/shared/navbar'
import PlayraLoader from '../features/shared/playra_loader'
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
          <Notifications position="bottom-right" />
          <AppContent />
        </MantineProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function AppContent() {
  const { loading: authLoading } = useContext(AuthContext)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isTransitioning = useRouterState({ select: (s) => s.isTransitioning })
  const isFetching = useIsFetching()

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')

  const [showTransitionLoader, setShowTransitionLoader] = useState(false)
  useEffect(() => {
    if (!isTransitioning) return
    const t = setTimeout(() => setShowTransitionLoader(true), 250)
    return () => {
      clearTimeout(t)
      setShowTransitionLoader(false)
    }
  }, [isTransitioning])

  if (authLoading) return <PlayraLoader />

  return (
    <>
      {showTransitionLoader && <PlayraLoader />}
      {isFetching > 0 && !showTransitionLoader && (
        <div className="fetch-bar"><span /></div>
      )}

      <AppShell header={{ height: isAuthPage ? 0 : 68 }} padding={0}>
        <AppShell.Header
          style={{
            display: isAuthPage ? 'none' : undefined,
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
    </>
  )
}

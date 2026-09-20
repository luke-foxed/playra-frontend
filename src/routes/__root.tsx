import { Outlet, createRootRouteWithContext, useNavigate, useRouterState } from '@tanstack/react-router'
import { useContext, useEffect, useRef, useState } from 'react'
import ErrorBoundary from '../features/shared/error_boundary'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider, useIsFetching } from '@tanstack/react-query'
import { MantineProvider, AppShell } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import AuthProvider, { AuthContext } from '../features/auth/providers/auth_provider'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
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

const isAuthPath = (pathname: string) => ['/login', '/signup'].some((p) => pathname.startsWith(p))
const isBarePath = (pathname: string) => isAuthPath(pathname) || pathname.startsWith('/restricted')

function AppContent() {
  const { session, loading: authLoading } = useContext(AuthContext)
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const prevSessionRef = useRef<typeof session>(undefined)

  useEffect(() => {
    if (authLoading) return
    const wasAuthed = prevSessionRef.current !== undefined && prevSessionRef.current !== null
    if (wasAuthed && !session && !isAuthPath(pathname)) {
      navigate({ to: '/login' })
    }
    prevSessionRef.current = session
  }, [session, authLoading, pathname, navigate])
  const isTransitioning = useRouterState({ select: (s) => s.isTransitioning })
  const isFetching = useIsFetching()

  const hideHeader = isBarePath(pathname)

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

      <AppShell header={{ height: hideHeader ? 0 : 68 }} padding={0}>
        <AppShell.Header
          display={hideHeader ? 'none' : undefined}
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
    </>
  )
}

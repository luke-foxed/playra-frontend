import { useContext, useEffect, useState } from 'react'
import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { Group, Text, Button, UnstyledButton, Avatar, Box, Drawer, ActionIcon, Burger, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { AuthContext } from '../auth/providers/auth_provider'
import supabase from '../../lib/supabase_client'
import Logo from './logo'
import SearchModal from './search_modal'
import { SearchIcon } from './icons'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkCast = Link as any

function avatarColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return `radial-gradient(circle at 30% 25%, hsl(${h} 80% 68%), hsl(${(h + 40) % 360} 70% 42%))`
}

export default function Navbar() {
  const { profile } = useContext(AuthContext)
  const [searchOpen, setSearchOpen] = useState(false)
  const [drawerOpen, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)
  const location = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName ?? ''))
      ) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const isActive = (path: string) =>
    path === '/' ? location === '/' : location.startsWith(path)

  const navLink = (path: string) => ({
    padding: '8px 14px', borderRadius: 999, fontSize: 14, fontWeight: 500,
    color: isActive(path) ? 'var(--mantine-color-dark-0)' : 'var(--mantine-color-dark-1)',
    background: isActive(path) ? 'var(--mantine-color-dark-5)' : 'transparent',
    transition: 'background 0.15s, color 0.15s', textDecoration: 'none', whiteSpace: 'nowrap' as const,
  })

  const drawerNavLink = (path: string) => ({
    ...navLink(path),
    display: 'block',
    width: '100%',
    padding: '10px 14px',
  })

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/login' })
  }

  return (
    <>
      <Group px="xl" h="100%" justify="space-between" maw={1440} mx="auto" wrap="nowrap" gap="lg">
        <UnstyledButton
          component={LinkCast}
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', flexShrink: 0 }}
        >
          <Logo size={34} />
          <Text fw={700} fz={23} style={{ letterSpacing: -0.8 }} c="dark.0">playra</Text>
        </UnstyledButton>

        {profile && (
          <Group gap={6} style={{ flexShrink: 0 }} visibleFrom="sm">
            <Link to="/" className="nav-link" style={navLink('/')}>Home</Link>
            <Link to="/games" search={{ page: 1, page_size: 20 }} className="nav-link" style={navLink('/games')}>Games</Link>
            <Link to="/lists" className="nav-link" style={navLink('/lists')}>Lists</Link>
            <Link to="/profile/$id" params={{ id: profile.id }} className="nav-link" style={navLink('/profile')}>Profile</Link>
            {profile.role === 'admin' && <Link to="/admin" className="nav-link" style={navLink('/admin')}>Admin</Link>}
          </Group>
        )}

        <Box style={{ flex: 1 }} visibleFrom="sm" />

        {profile && (
          <UnstyledButton
            onClick={() => setSearchOpen(true)}
            visibleFrom="sm"
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: 'var(--mantine-color-dark-6)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 999, padding: '9px 15px', minWidth: 220, cursor: 'pointer',
            }}
          >
            <SearchIcon size={17} style={{ color: 'var(--mantine-color-dark-2)', flexShrink: 0 }} />
            <Text fz="sm" c="dark.2" style={{ flex: 1 }}>Search games…</Text>
            <Text fz={11} c="dark.2" ff="monospace"
              style={{ background: 'var(--mantine-color-dark-5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 7px' }}>
              /
            </Text>
          </UnstyledButton>
        )}

        {/* Mobile: search icon + burger */}
        <Group gap="xs" hiddenFrom="sm" style={{ flex: 1, justifyContent: 'flex-end' }}>
          {profile && (
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => setSearchOpen(true)}>
              <SearchIcon size={18} />
            </ActionIcon>
          )}
          {profile && (
            <Burger opened={drawerOpen} onClick={openDrawer} size="sm" color="var(--mantine-color-dark-1)" />
          )}
        </Group>

        {profile ? (
          <Group gap="xs" style={{ flexShrink: 0 }}>
            <UnstyledButton component={LinkCast} to="/profile/$id" params={{ id: profile.id }} className="avatar-btn">
              <Avatar
                src={profile.avatar_url ?? undefined}
                alt={profile.username ?? profile.email}
                size={38}
                radius="xl"
                style={{ transform: 'translateZ(0)', ...(!profile.avatar_url ? { background: avatarColor(profile?.username ?? profile.email) } : {}) }}
                color="violet"
              >
                {!profile.avatar_url && ((profile?.username ?? profile.email)[0] ?? '?').toUpperCase()}
              </Avatar>
            </UnstyledButton>
            <Button variant="subtle" color="gray" size="sm" visibleFrom="sm" onClick={signOut}>
              Sign out
            </Button>
          </Group>
        ) : (
          <Group gap="xs" style={{ flexShrink: 0 }}>
            <Button variant="outline" color="gray" size="sm" component={LinkCast} to="/login">Log in</Button>
            <Button size="sm" component={LinkCast} to="/signup">Sign up</Button>
          </Group>
        )}
      </Group>

      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        position="left"
        size="xs"
        padding="xl"
        styles={{
          content: { background: 'var(--mantine-color-dark-7)' },
          header: { background: 'var(--mantine-color-dark-7)' },
        }}
        title={
          <Group gap={10}>
            <Logo size={28} />
            <Text fw={700} fz={20} style={{ letterSpacing: -0.6 }} c="dark.0">playra</Text>
          </Group>
        }
      >
        <Stack gap="xs" mt="md">
          {profile && <Link to="/" style={drawerNavLink('/')} onClick={closeDrawer}>Home</Link>}
          {profile && <Link to="/games" search={{ page: 1, page_size: 20 }} style={drawerNavLink('/games')} onClick={closeDrawer}>Games</Link>}
          {profile && <Link to="/lists" style={drawerNavLink('/lists')} onClick={closeDrawer}>Lists</Link>}
          {profile && <Link to="/profile/$id" params={{ id: profile.id }} style={drawerNavLink('/profile')} onClick={closeDrawer}>Profile</Link>}
          {profile?.role === 'admin' && <Link to="/admin" style={drawerNavLink('/admin')} onClick={closeDrawer}>Admin</Link>}
        </Stack>
        {profile && (
          <Button variant="subtle" color="gray" fullWidth mt="xl" onClick={async () => { await signOut(); closeDrawer() }}>
            Sign out
          </Button>
        )}
      </Drawer>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  )
}

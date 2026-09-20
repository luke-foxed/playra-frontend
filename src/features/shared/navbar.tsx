import { useContext } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Group, Text, Button, UnstyledButton, Drawer, ActionIcon, Burger, Stack, Kbd, NavLink } from '@mantine/core'
import { useDisclosure, useHotkeys, useHover } from '@mantine/hooks'
import { AuthContext } from '../auth/providers/auth_provider'
import supabase from '../../lib/supabase_client'
import Logo from './logo'
import SearchModal from './search_modal'
import UserAvatar from './user_avatar'
import { SearchIcon } from './icons'

// polymorphic `component` can't infer TanStack Link props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkCast = Link as any

export default function Navbar() {
  const { profile } = useContext(AuthContext)
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [searchOpen, { open: openSearch, close: closeSearch }] = useDisclosure(false)
  const [drawerOpen, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)
  const { hovered: avatarHovered, ref: avatarRef } = useHover<HTMLAnchorElement>()

  useHotkeys([['mod+K', openSearch]], [])
  useHotkeys([['/', openSearch]])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/login' })
  }

  const links = profile
    ? [
        { label: 'Home', to: '/', match: (p: string) => p === '/' },
        { label: 'Games', to: '/games', search: { page: 1, page_size: 20 }, match: (p: string) => p.startsWith('/games') },
        { label: 'Lists', to: '/lists', match: (p: string) => p.startsWith('/lists') },
        { label: 'Profile', to: '/profile/$id', params: { id: profile.id }, match: (p: string) => p.startsWith('/profile') },
        ...(profile.role === 'admin' ? [{ label: 'Admin', to: '/admin', match: (p: string) => p.startsWith('/admin') }] : []),
      ]
    : []

  const displayName = profile ? (profile.username ?? profile.email) : ''

  return (
    <>
      <Group px="xl" h="100%" justify="space-between" maw={1440} mx="auto" wrap="nowrap" gap="lg">
        <UnstyledButton component={LinkCast} to="/" display="flex" style={{ alignItems: 'center', gap: 11, flexShrink: 0 }}>
          <Logo size={34} />
          <Text fw={700} fz={23} c="dark.0" style={{ letterSpacing: -0.8 }}>playra</Text>
        </UnstyledButton>

        <Group gap={6} visibleFrom="sm" flex={1} wrap="nowrap">
          {links.map(({ label, match, ...link }) => (
            <Button
              key={label}
              component={LinkCast}
              {...link}
              variant={match(pathname) ? 'light' : 'subtle'}
              color="gray"
              radius="xl"
            >
              {label}
            </Button>
          ))}
        </Group>

        {profile && (
          <Button
            visibleFrom="sm"
            variant="default"
            radius="xl"
            miw={220}
            justify="space-between"
            c="dark.2"
            leftSection={<SearchIcon size={17} />}
            rightSection={<Kbd>/</Kbd>}
            onClick={openSearch}
          >
            Search games…
          </Button>
        )}

        {profile && (
          <Group gap="xs" hiddenFrom="sm">
            <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Search" onClick={openSearch}>
              <SearchIcon size={18} />
            </ActionIcon>
            <Burger opened={drawerOpen} onClick={openDrawer} size="sm" color="var(--mantine-color-dark-1)" aria-label="Open menu" />
          </Group>
        )}

        {profile ? (
          <Group gap="xs" style={{ flexShrink: 0 }}>
            <UnstyledButton ref={avatarRef} component={LinkCast} to="/profile/$id" params={{ id: profile.id }} aria-label="Your profile">
              <UserAvatar
                avatarUrl={profile.avatar_url}
                name={displayName}
                size={38}
                style={{ boxShadow: avatarHovered ? '0 0 0 2px var(--mantine-color-violet-5)' : 'none', transition: 'box-shadow 0.15s' }}
              />
            </UnstyledButton>
            <Button variant="subtle" color="gray" size="sm" visibleFrom="sm" onClick={signOut}>Sign out</Button>
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
        title={
          <Group gap={10}>
            <Logo size={28} />
            <Text fw={700} fz={20} c="dark.0" style={{ letterSpacing: -0.6 }}>playra</Text>
          </Group>
        }
      >
        {profile && (
          <>
            <Stack gap="xs" mt="md">
              {links.map(({ label, match, ...link }) => (
                <NavLink
                  key={label}
                  component={LinkCast}
                  {...link}
                  label={label}
                  active={match(pathname)}
                  variant="light"
                  onClick={closeDrawer}
                  style={{ borderRadius: 999 }}
                />
              ))}
            </Stack>
            <Button variant="subtle" color="gray" fullWidth mt="xl" onClick={async () => { await signOut(); closeDrawer() }}>
              Sign out
            </Button>
          </>
        )}
      </Drawer>

      {searchOpen && <SearchModal onClose={closeSearch} />}
    </>
  )
}

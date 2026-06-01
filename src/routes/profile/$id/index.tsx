import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useContext } from 'react'
import { useSuspenseQuery, useQueryClient, useQuery } from '@tanstack/react-query'
import { useMediaQuery } from '@mantine/hooks'
import {
  Box, Text, Title, Group, Stack, Avatar, Button, SimpleGrid,
  Container, Anchor, TextInput, Modal,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { profileQueryOptions, updateProfile } from '../../../features/profile/api/profile'
import { listsQueryOptions, listDetailQueryOptions, createList } from '../../../features/lists/api/lists'
import { AuthContext } from '../../../features/auth/providers/auth_provider'
import type { List } from '../../../features/lists/api/schemas'
import {
  EditIcon, PlusIcon, ListIcon, HeartIcon, StarIcon,
  GlobeIcon, ChevronIcon, BookmarkIcon,
} from '../../../features/shared/icons'
import PlayraLoader from '../../../features/shared/playra_loader'
import { AvatarSelector } from '../../../features/profile/components/avatar_selector'

export const Route = createFileRoute('/profile/$id/')({
  component: RouteComponent,
  loader: ({ context: { queryClient }, params }) =>
    Promise.all([
      queryClient.ensureQueryData(profileQueryOptions(params.id)),
      queryClient.ensureQueryData(listsQueryOptions()),
    ]),
  pendingComponent: () => <PlayraLoader />,
})

function avatarColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return `radial-gradient(circle at 30% 25%, hsl(${h} 80% 68%), hsl(${(h + 40) % 360} 70% 42%))`
}

function RouteComponent() {
  const params = Route.useParams()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { profile: currentUser } = useContext(AuthContext)
  const isOwn = currentUser?.id === params.id

  const { data: profile } = useSuspenseQuery(profileQueryOptions(params.id))
  const { data: lists } = useSuspenseQuery(listsQueryOptions())

  const isMobile = useMediaQuery('(max-width: 48em)')
  const [editOpen, setEditOpen] = useState(false)
  const [newListOpen, setNewListOpen] = useState(false)

  const goToList = (listId: string) =>
    navigate({ to: '/profile/$id/lists/$listId', params: { id: params.id, listId } })

  return (
    <Container size={1440} px={{ base: 'md', sm: 'xl' }} pb="xl" pt="xl">
      <Group align="center" gap="xl" wrap="wrap" pb="xl" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} mb="md">
        <HoverableAvatar
          src={profile.avatar_url ?? undefined}
          alt={profile.username ?? profile.email}
          fallbackChar={((profile.username ?? profile.email)[0] ?? '?').toUpperCase()}
          bg={!profile.avatar_url ? avatarColor(profile.username ?? profile.email) : undefined}
          editable={isOwn}
          onEdit={() => setEditOpen(true)}
          size={isMobile ? 72 : 96}
        />
        <Stack gap={4} style={{ flex: 1 }}>
          <Title order={1} fz={{ base: 22, sm: 32 }} style={{ letterSpacing: -1 }}>{profile.username ?? profile.email}</Title>
          <Group gap="md" align="center">
            {profile.username && <Text fz="sm" c="dark.2" ff="monospace">@{profile.username}</Text>}
            <Text fz="sm" c="dark.3" ff="monospace">{profile.email}</Text>
          </Group>
          <Group gap="xl" mt="xs">
            <Text fz="sm" c="dark.2"><strong style={{ color: 'var(--mantine-color-dark-0)', fontFamily: 'var(--mantine-font-family-monospace)' }}>{lists.length}</strong> lists</Text>
          </Group>
        </Stack>
        {isOwn && (
          <Button variant="outline" color="gray" leftSection={<EditIcon size={16} />} onClick={() => setEditOpen(true)}>
            Edit profile
          </Button>
        )}
      </Group>

      {(() => {
        const pinned = lists.filter((l) => l.type === 'wishlist' || l.type === 'ratings')
        if (pinned.length === 0) return null
        return (
          <Box mb={44}>
            <Group justify="space-between" align="flex-end" mb="lg">
              <Group gap={10}>
                <Box style={{ color: 'var(--mantine-color-violet-4)', display: 'grid' }}><BookmarkIcon size={19} /></Box>
                <Title order={2} style={{ letterSpacing: -0.6 }}>Quick lists</Title>
              </Group>
              <Text fz={11} tt="uppercase" fw={600} c="dark.3" ff="monospace" style={{ letterSpacing: '0.09em' }}>Always pinned</Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {pinned.map((l) => <PinnedCard key={l.id} list={l} onOpen={() => goToList(l.id)} />)}
            </SimpleGrid>
          </Box>
        )
      })()}

      {(() => {
        const custom = lists.filter((l) => l.type === 'custom')
        return (
          <Box mb={60}>
            <Group justify="space-between" align="center" mb="lg">
              <Group gap={10}>
                <Box style={{ color: 'var(--mantine-color-violet-4)', display: 'grid' }}><ListIcon size={19} /></Box>
                <Title order={2} style={{ letterSpacing: -0.6 }}>Your lists</Title>
              </Group>
              {isOwn && (
                <Anchor component="button" c="dark.2" fz="sm" onClick={() => setNewListOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  New list <PlusIcon size={14} />
                </Anchor>
              )}
            </Group>
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
              {custom.map((l) => (
                <ListCard key={l.id} list={l} onOpen={() => goToList(l.id)} />
              ))}
              {isOwn && (
                <Box
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 10, minHeight: 184, border: '1.5px dashed rgba(255,255,255,0.14)',
                    borderRadius: 'var(--mantine-radius-md)', cursor: 'pointer',
                    color: 'var(--mantine-color-dark-2)', fontSize: 14, fontWeight: 500,
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onClick={() => setNewListOpen(true)}
                >
                  <PlusIcon size={26} />
                  <span>Create a list</span>
                </Box>
              )}
            </SimpleGrid>
          </Box>
        )
      })()}

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={async (values) => {
            await updateProfile(params.id, values)
            qc.invalidateQueries(profileQueryOptions(params.id))
            notifications.show({ title: 'Profile updated', message: 'Your changes have been saved', color: 'green' })
            setEditOpen(false)
          }}
        />
      )}

      <Modal opened={newListOpen} onClose={() => setNewListOpen(false)} title="New list" size="sm">
        <NewListForm
          onClose={() => setNewListOpen(false)}
          onCreate={async (name) => {
            await createList({ name, description: null, is_public: false })
            qc.invalidateQueries(listsQueryOptions())
            notifications.show({ title: 'List created', message: `"${name}" is ready`, color: 'green' })
            setNewListOpen(false)
          }}
        />
      </Modal>
    </Container>
  )
}

function HoverableAvatar({
  src, alt, fallbackChar, bg, editable, onEdit, size = 96,
}: {
  src?: string; alt: string; fallbackChar: string
  bg?: string; editable: boolean; onEdit: () => void; size?: number
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <Box
      style={{ position: 'relative', cursor: editable ? 'pointer' : 'default', flexShrink: 0 }}
      onMouseEnter={() => editable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => editable && onEdit()}
    >
      <Avatar
        src={src}
        alt={alt}
        size={size}
        radius="xl"
        style={{ transform: 'translateZ(0)', ...(bg ? { background: bg } : {}) }}
        color="violet"
      >
        {!src && fallbackChar}
      </Avatar>
      {editable && hovered && (
        <Box style={{
          position: 'absolute', inset: 0, borderRadius: 'var(--mantine-radius-xl)',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.15s',
        }}>
          <EditIcon size={22} style={{ color: 'white' }} />
        </Box>
      )}
    </Box>
  )
}

const PINNED_META: Record<string, { Icon: React.ComponentType<{ size?: number; fill?: boolean; style?: React.CSSProperties }>, fill?: boolean, accent: string, blurb: string }> = {
  wishlist: { Icon: HeartIcon, fill: false, accent: '#F498C8', blurb: "Games you're itching to play" },
  ratings:  { Icon: StarIcon,  fill: true,  accent: '#F0C36B', blurb: "Games you've scored & rated" },
}

function PinnedCard({ list, onOpen }: { list: List; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false)
  const meta = PINNED_META[list.type] ?? { Icon: ListIcon, fill: false, accent: '#B098FF', blurb: '' }
  const { Icon, fill, accent } = meta
  const { data: detail } = useQuery({ ...listDetailQueryOptions(list.id), staleTime: 60_000 })
  const n = detail?.games.length ?? list.game_count ?? null

  return (
    <Box
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        borderRadius: 20, minHeight: 188, padding: '24px 26px',
        display: 'flex',
        background: 'var(--mantine-color-dark-6)',
        boxShadow: hovered
          ? `0 24px 52px -24px rgba(0,0,0,.75), inset 0 0 0 1px color-mix(in oklab, ${accent} 55%, transparent)`
          : 'inset 0 0 0 1px rgba(255,255,255,0.12)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'transform 0.16s, box-shadow 0.16s',
      }}
    >
      <Box style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `linear-gradient(120deg, color-mix(in oklab, ${accent} 26%, transparent) 0%, transparent 58%), linear-gradient(160deg, var(--mantine-color-dark-6) 10%, var(--mantine-color-dark-8) 130%)`,
      }} />
      <Box style={{
        position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
        backgroundImage: `radial-gradient(color-mix(in oklab, ${accent} 30%, transparent) 1px, transparent 1.4px)`,
        backgroundSize: '22px 22px',
        WebkitMaskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)',
        maskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)',
      }} />
      <Box style={{
        position: 'absolute', width: 320, height: 320, right: -36, top: -126,
        borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle, color-mix(in oklab, ${accent} 52%, transparent) 0%, transparent 66%)`,
        filter: 'blur(4px)',
      }} />
      <Box style={{
        position: 'absolute', right: -26, bottom: -52, lineHeight: 0, pointerEvents: 'none',
        color: accent, opacity: 0.2,
        filter: `drop-shadow(0 8px 24px color-mix(in oklab, ${accent} 50%, transparent))`,
      }}>
        <Icon size={224} fill={fill} />
      </Box>

      <Box style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
        <Box>
          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: 0.3, color: accent, marginBottom: 9 }}>
            <Icon size={14} fill={fill} /> {list.name}
          </Box>
          <Text fw={700} fz={18} style={{ letterSpacing: -0.4, lineHeight: 1.25, maxWidth: '17ch', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
            {meta.blurb}
          </Text>
        </Box>
        <Group align="center" gap={8} mt="md">
          <Text fz={13} c="dark.2">
            <strong style={{ fontFamily: 'var(--mantine-font-family-monospace)', fontWeight: 700, color: 'var(--mantine-color-dark-0)', fontSize: 17 }}>
              {n ?? '—'}
            </strong>{' '}
            {n === 1 ? 'game' : 'games'}
          </Text>
          <Box style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 12.5, fontWeight: 600, color: accent,
            opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'opacity 0.16s, transform 0.16s',
          }}>
            Open <ChevronIcon size={13} />
          </Box>
        </Group>
      </Box>
    </Box>
  )
}

function ListCard({ list, onOpen }: { list: List; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false)
  const n = list.game_count ?? null
  return (
    <Box
      style={{
        background: 'var(--mantine-color-dark-6)', borderRadius: 14,
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: hovered
          ? '0 16px 36px -18px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,0.14)'
          : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'transform 0.14s, box-shadow 0.14s',
      }}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box style={{
        position: 'relative', height: 132,
        background: list.cover_url
          ? `url('${list.cover_url}') center / cover no-repeat var(--mantine-color-dark-7)`
          : 'linear-gradient(135deg, color-mix(in oklab, var(--mantine-color-violet-8) 30%, var(--mantine-color-dark-7)) 0%, var(--mantine-color-dark-7) 100%)',
        display: 'grid', placeItems: 'center',
      }}>
        {!list.cover_url && (
          <Box style={{ color: 'var(--mantine-color-violet-4)', opacity: 0.35 }}>
            <ListIcon size={24} />
          </Box>
        )}
        {list.is_public && (
          <Box style={{
            position: 'absolute', top: 10, right: 10, zIndex: 2,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'color-mix(in oklab, var(--mantine-color-dark-8) 66%, transparent)',
            backdropFilter: 'blur(6px)',
            color: '#7CC8E3', fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3,
            padding: '4px 9px', borderRadius: 999,
            boxShadow: 'inset 0 0 0 1px color-mix(in oklab, #7CC8E3 36%, transparent)',
          }}>
            <GlobeIcon size={12} /> Public
          </Box>
        )}
      </Box>
      <Box style={{ padding: '13px 14px' }}>
        <Text fw={600} fz={15} style={{ letterSpacing: -0.2 }}>{list.name}</Text>
        <Text fz={11.5} c="dark.3" mt={3} ff="monospace">
          {n !== null ? `${n} ${n === 1 ? 'game' : 'games'}` : '—'}
        </Text>
      </Box>
    </Box>
  )
}

function EditProfileModal({
  profile, onClose, onSave,
}: {
  profile: { username: string | null; email: string; avatar_url: string | null }
  onClose: () => void
  onSave: (values: { username: string; avatar_url: string | null }) => Promise<void>
}) {
  const [username, setUsername] = useState(profile.username ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await onSave({ username: username.trim() || profile.email, avatar_url: avatarUrl.trim() || null })
    setSaving(false)
  }

  return (
    <Modal
      opened
      onClose={onClose}
      title="Edit profile"
      size={520}
      styles={{ title: { fontSize: 22, fontWeight: 700, letterSpacing: -0.5 } }}
    >
      <Stack gap="md">
        <Box
          style={{
            background: 'var(--mantine-color-dark-6)',
            borderRadius: 'var(--mantine-radius-md)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            padding: '14px 16px',
          }}
        >
          <Text fz="xs" tt="uppercase" fw={700} c="dark.1" ff="monospace" mb={10} style={{ letterSpacing: '0.09em' }}>
            Display name
          </Text>
          <TextInput
            placeholder={profile.email}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            styles={{ input: { background: 'var(--mantine-color-dark-7)', border: '1px solid rgba(255,255,255,0.10)' } }}
          />
        </Box>
        <AvatarSelector initialUrl={profile.avatar_url} onChange={setAvatarUrl} />
        <Group gap="xs" mt="xs">
          <Button variant="default" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
          <Button style={{ flex: 1 }} loading={saving} onClick={save}>Save changes</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function NewListForm({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const create = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onCreate(name.trim())
    setSaving(false)
  }
  return (
    <Stack gap="sm">
      <Text fz="sm" c="dark.2">Give your list a name. You can add games after.</Text>
      <TextInput
        placeholder="e.g. Comfort games, 2026 backlog…"
        value={name}
        autoFocus
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && create()}
      />
      <Group gap="xs" mt="xs">
        <Button variant="default" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
        <Button style={{ flex: 1 }} disabled={!name.trim()} loading={saving} onClick={create}>Create list</Button>
      </Group>
    </Stack>
  )
}

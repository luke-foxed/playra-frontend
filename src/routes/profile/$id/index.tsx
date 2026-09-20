import { createFileRoute } from '@tanstack/react-router'
import { useContext } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useDisclosure, useHover } from '@mantine/hooks'
import { Anchor, Avatar, Box, Button, Container, Group, Modal, Paper, SimpleGrid, Stack, Text, TextInput, Title, UnstyledButton } from '@mantine/core'
import { profileQueryOptions } from '../../../features/profile/api/profile'
import { listsQueryOptions } from '../../../features/lists/api/lists'
import { AuthContext } from '../../../features/auth/providers/auth_provider'
import { BookmarkIcon, EditIcon, ListIcon, PlusIcon } from '../../../features/shared/icons'
import SectionHeading from '../../../features/shared/section_heading'
import { avatarColor } from '../../../features/shared/avatar_color'
import { AvatarSelector } from '../../../features/profile/components/avatar_selector'
import useUpdateProfile from '../../../features/profile/hooks/useUpdateProfile'
import PinnedCard from '../../../features/lists/components/pinned_card'
import ListCover from '../../../features/lists/components/list_cover'
import type { List } from '../../../features/lists/api/schemas'
import useCreateList from '../../../features/lists/hooks/useCreateList'

export const Route = createFileRoute('/profile/$id/')({
  component: RouteComponent,
  loader: ({ context: { queryClient }, params }) =>
    Promise.all([
      queryClient.ensureQueryData(profileQueryOptions(params.id)),
      queryClient.ensureQueryData(listsQueryOptions(params.id)),
    ]),
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { profile: currentUser } = useContext(AuthContext)
  const isOwn = currentUser?.id === id

  const { data: profile } = useSuspenseQuery(profileQueryOptions(id))
  const { data: lists } = useSuspenseQuery(listsQueryOptions(id))

  const [editOpen, { open: openEdit, close: closeEdit }] = useDisclosure(false)
  const [newListOpen, { open: openNewList, close: closeNewList }] = useDisclosure(false)
  const updateProfile = useUpdateProfile(id)
  const { createList, isLoading: creatingList } = useCreateList()

  const displayName = profile.username ?? profile.email
  const pinned = lists.filter((l) => l.type === 'wishlist' || l.type === 'ratings')
  const custom = lists.filter((l) => l.type === 'custom')

  return (
    <Container size={1440} px={{ base: 'md', sm: 'xl' }} pb="xl" pt="xl">
      <Group align="center" gap="xl" wrap="wrap" pb="xl" mb="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <EditableAvatar
          src={profile.avatar_url ?? undefined}
          alt={displayName}
          fallbackChar={(displayName[0] ?? '?').toUpperCase()}
          bg={!profile.avatar_url ? avatarColor(displayName) : undefined}
          editable={isOwn}
          onEdit={openEdit}
          size={96}
        />
        <Stack gap={4} flex={1}>
          <Title order={1} fz={{ base: 22, sm: 32 }} style={{ letterSpacing: -1 }}>{displayName}</Title>
          <Group gap="md" align="center">
            {profile.username && <Text fz="sm" c="dark.2" ff="monospace">@{profile.username}</Text>}
            <Text fz="sm" c="dark.3" ff="monospace">{profile.email}</Text>
          </Group>
          <Text fz="sm" c="dark.2" mt="xs">
            <Text span fw={700} c="dark.0" ff="monospace">{lists.length}</Text> lists
          </Text>
        </Stack>
        {isOwn && (
          <Button variant="outline" color="gray" leftSection={<EditIcon size={16} />} onClick={openEdit}>
            Edit profile
          </Button>
        )}
      </Group>

      {pinned.length > 0 && (
        <Box mb={44}>
          <SectionHeading
            icon={<BookmarkIcon size={19} />}
            right={<Text fz={11} tt="uppercase" fw={600} c="dark.3" ff="monospace" style={{ letterSpacing: '0.09em' }}>Always pinned</Text>}
          >
            Quick lists
          </SectionHeading>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {pinned.map((l) => <PinnedCard key={l.id} list={l} profileId={id} />)}
          </SimpleGrid>
        </Box>
      )}

      <Box mb={60}>
        <SectionHeading
          icon={<ListIcon size={19} />}
          right={isOwn && (
            <Anchor component="button" c="dark.2" fz="sm" onClick={openNewList}>
              <Group gap={5} component="span">New list <PlusIcon size={14} /></Group>
            </Anchor>
          )}
        >
          {isOwn ? 'Your lists' : 'Lists'}
        </SectionHeading>
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
          {custom.map((l) => <ListCard key={l.id} list={l} profileId={id} />)}
          {isOwn && (
            <NewListTile onClick={openNewList} />
          )}
        </SimpleGrid>
        {custom.length === 0 && !isOwn && <Text c="dark.2" fz="sm">No public lists yet.</Text>}
      </Box>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          saving={updateProfile.isPending}
          onClose={closeEdit}
          onSave={(values) => updateProfile.mutate(values, { onSuccess: closeEdit })}
        />
      )}

      <Modal opened={newListOpen} onClose={closeNewList} title="New list" size="sm">
        <NewListForm
          saving={creatingList}
          onClose={closeNewList}
          onCreate={(name) => createList({ name, description: null, is_public: false }).then(closeNewList).catch(() => {})}
        />
      </Modal>
    </Container>
  )
}

function EditableAvatar({ src, alt, fallbackChar, bg, editable, onEdit, size }: {
  src?: string; alt: string; fallbackChar: string; bg?: string; editable: boolean; onEdit: () => void; size: number
}) {
  const { hovered, ref } = useHover<HTMLDivElement>()
  const avatar = (
    <Avatar src={src} alt={alt} size={size} radius="xl" color="violet" style={{ transform: 'translateZ(0)', ...(bg ? { background: bg } : {}) }}>
      {!src && fallbackChar}
    </Avatar>
  )
  if (!editable) return avatar

  return (
    <Box
      ref={ref}
      pos="relative"
      role="button"
      tabIndex={0}
      aria-label="Edit profile"
      style={{ cursor: 'pointer', flexShrink: 0 }}
      onClick={onEdit}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit() } }}
    >
      {avatar}
      <Box
        pos="absolute"
        inset={0}
        bdrs="xl"
        c="white"
        bg="rgba(0,0,0,0.55)"
        display="flex"
        opacity={hovered ? 1 : 0}
        style={{ alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)', transition: 'opacity 0.15s' }}
      >
        <EditIcon size={22} />
      </Box>
    </Box>
  )
}

function ListCard({ list, profileId }: { list: List; profileId: string }) {
  const { hovered, ref } = useHover<HTMLAnchorElement>()
  const n = list.game_count ?? null

  return (
    <Link
      ref={ref}
      to="/profile/$id/lists/$listId"
      params={{ id: profileId, listId: list.id }}
      style={{
        display: 'block',
        overflow: 'hidden',
        borderRadius: 14,
        background: 'var(--mantine-color-dark-6)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.14s, box-shadow 0.14s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered
          ? '0 16px 36px -18px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,0.14)'
          : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      <ListCover list={list} />
      <Box px={14} py={13}>
        <Text fw={600} fz={15} style={{ letterSpacing: -0.2 }}>{list.name}</Text>
        <Text fz={11.5} c="dark.3" mt={3} ff="monospace">{n !== null ? `${n} ${n === 1 ? 'game' : 'games'}` : '—'}</Text>
      </Box>
    </Link>
  )
}

function NewListTile({ onClick }: { onClick: () => void }) {
  const { hovered, ref } = useHover<HTMLButtonElement>()
  return (
    <UnstyledButton
      ref={ref}
      onClick={onClick}
      mih={184}
      bdrs="md"
      fz={14}
      fw={500}
      c={hovered ? 'dark.0' : 'dark.2'}
      display="flex"
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        border: `1.5px dashed ${hovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.14)'}`,
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      <PlusIcon size={26} />
      Create a list
    </UnstyledButton>
  )
}

function NewListForm({ saving, onClose, onCreate }: { saving: boolean; onClose: () => void; onCreate: (name: string) => void }) {
  const form = useForm({
    initialValues: { name: '' },
    validate: { name: (v) => (v.trim() ? null : 'Name is required') },
  })

  return (
    <form onSubmit={form.onSubmit(({ name }) => onCreate(name.trim()))}>
      <Stack gap="sm">
        <Text fz="sm" c="dark.2">Give your list a name. You can add games after.</Text>
        <TextInput placeholder="e.g. Comfort games, 2026 backlog…" data-autofocus {...form.getInputProps('name')} />
        <Group gap="xs" mt="xs">
          <Button variant="default" flex={1} onClick={onClose}>Cancel</Button>
          <Button type="submit" flex={1} loading={saving}>Create list</Button>
        </Group>
      </Stack>
    </form>
  )
}

type Props = {
  profile: { username: string | null; email: string; avatar_url: string | null }
  saving: boolean
  onClose: () => void
  onSave: (values: { username: string; avatar_url: string | null }) => void
}

function EditProfileModal({ profile, saving, onClose, onSave }: Props) {
  const form = useForm({
    initialValues: { username: profile.username ?? '', avatar_url: profile.avatar_url ?? '' },
    validate: {
      username: (v) => (v.trim().length > 30 ? 'Max 30 characters' : null),
    },
  })

  const submit = form.onSubmit((values) =>
    onSave({ username: values.username.trim() || profile.email, avatar_url: values.avatar_url.trim() || null }),
  )

  return (
    <Modal opened onClose={onClose} title="Edit profile" size={520} styles={{ title: { fontSize: 22, fontWeight: 700, letterSpacing: -0.5 } }}>
      <form onSubmit={submit}>
        <Stack gap="md">
          <Paper bg="dark.6" bdrs="md" px={16} py={14} style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
            <Text fz="xs" tt="uppercase" fw={700} c="dark.1" ff="monospace" mb={10} style={{ letterSpacing: '0.09em' }}>
              Display name
            </Text>
            <TextInput
              placeholder={profile.email}
              styles={{ input: { background: 'var(--mantine-color-dark-7)', border: '1px solid rgba(255,255,255,0.10)' } }}
              {...form.getInputProps('username')}
            />
          </Paper>
          <Box>
            <AvatarSelector initialUrl={profile.avatar_url} onChange={(url) => form.setFieldValue('avatar_url', url)} />
          </Box>
          <Group gap="xs" mt="xs">
            <Button variant="default" flex={1} onClick={onClose}>Cancel</Button>
            <Button type="submit" flex={1} loading={saving}>Save changes</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { useState, useContext } from 'react'
import { useSuspenseQuery, useQueryClient, useQuery } from '@tanstack/react-query'
import {
  Box, Text, Title, Group, Stack, Avatar, Button, SimpleGrid,
  Container, Anchor, TextInput, Modal, Badge, ActionIcon,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { profileQueryOptions, updateProfile } from '../../features/profile/api/profile'
import { listsQueryOptions, listDetailQueryOptions, getList, deleteList, updateList, removeGamesFromList, createList } from '../../features/lists/api/lists'
import routeProtector from '../../lib/route_protector'
import { AuthContext } from '../../features/auth/providers/auth_provider'
import type { List, ListDetail } from '../../features/lists/api/schemas'
import GameCard from '../../features/games/components/game_card'
import {
  EditIcon, PlusIcon, ListIcon, HeartIcon, PlayIcon, StarIcon,
  GlobeIcon, LockIcon, XIcon, TrashIcon, ArrowLeftIcon, SearchIcon, BookmarkIcon, ChevronIcon,
} from '../../features/shared/icons'
import PlayraLoader from '../../features/shared/playra_loader'
import { AvatarSelector } from '../../features/profile/components/avatar_selector'

export const Route = createFileRoute('/profile/$id')({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: ({ context: { queryClient }, params }) =>
    Promise.all([
      queryClient.ensureQueryData(profileQueryOptions(params.id)),
      queryClient.ensureQueryData(listsQueryOptions()),
    ]),
  pendingComponent: () => <PlayraLoader />
})

function avatarColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return `radial-gradient(circle at 30% 25%, hsl(${h} 80% 68%), hsl(${(h + 40) % 360} 70% 42%))`
}

function ListTypeIcon({ type }: { type: string }) {
  if (type === 'wishlist') return <HeartIcon size={18} />
  if (type === 'ratings') return <PlayIcon size={18} />
  return <ListIcon size={18} />
}

function RouteComponent() {
  const params = Route.useParams()
  const qc = useQueryClient()
  const { profile: currentUser } = useContext(AuthContext)
  const isOwn = currentUser?.id === params.id

  const { data: profile } = useSuspenseQuery(profileQueryOptions(params.id))
  const { data: lists } = useSuspenseQuery(listsQueryOptions())

  const [openListId, setOpenListId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [newListOpen, setNewListOpen] = useState(false)

  const openList = openListId ? lists.find((l) => l.id === openListId) : null

  if (openList) {
    return (
      <ListDetailView
        list={openList}
        isOwn={isOwn}
        onBack={() => setOpenListId(null)}
        onRefresh={() => qc.invalidateQueries(listsQueryOptions())}
      />
    )
  }

  return (
    <Container size={1240} px="xl" pb="xl" pt="xl">
      {/* Profile header */}
      <Group align="center" gap="xl" pb="xl" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} mb="md">
        <HoverableAvatar
          src={profile.avatar_url ?? undefined}
          alt={profile.username ?? profile.email}
          fallbackChar={((profile.username ?? profile.email)[0] ?? '?').toUpperCase()}
          bg={!profile.avatar_url ? avatarColor(profile.username ?? profile.email) : undefined}
          editable={isOwn}
          onEdit={() => setEditOpen(true)}
        />
        <Stack gap={4} style={{ flex: 1 }}>
          <Title order={1} style={{ letterSpacing: -1, fontSize: 32 }}>{profile.username ?? profile.email}</Title>
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

      {/* Quick lists — wishlist + ratings */}
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
              {pinned.map((l) => <PinnedCard key={l.id} list={l} onOpen={() => setOpenListId(l.id)} />)}
            </SimpleGrid>
          </Box>
        )
      })()}

      {/* Custom lists */}
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
                <ListCard key={l.id} list={l} onOpen={() => setOpenListId(l.id)} />
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
            notifications.show({ message: 'Profile updated', color: 'green' })
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
            notifications.show({ message: `Created "${name}"`, color: 'green' })
            setNewListOpen(false)
          }}
        />
      </Modal>
    </Container>
  )
}

function HoverableAvatar({
  src, alt, fallbackChar, bg, editable, onEdit,
}: {
  src?: string; alt: string; fallbackChar: string
  bg?: string; editable: boolean; onEdit: () => void
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
        size={96}
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
      {/* gradient + bg */}
      <Box style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `linear-gradient(120deg, color-mix(in oklab, ${accent} 26%, transparent) 0%, transparent 58%), linear-gradient(160deg, var(--mantine-color-dark-6) 10%, var(--mantine-color-dark-8) 130%)`,
      }} />
      {/* dot texture */}
      <Box style={{
        position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
        backgroundImage: `radial-gradient(color-mix(in oklab, ${accent} 30%, transparent) 1px, transparent 1.4px)`,
        backgroundSize: '22px 22px',
        WebkitMaskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)',
        maskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)',
      }} />
      {/* bloom orb */}
      <Box style={{
        position: 'absolute', width: 320, height: 320, right: -36, top: -126,
        borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle, color-mix(in oklab, ${accent} 52%, transparent) 0%, transparent 66%)`,
        filter: 'blur(4px)',
      }} />
      {/* oversized glyph */}
      <Box style={{
        position: 'absolute', right: -26, bottom: -52, lineHeight: 0, pointerEvents: 'none',
        color: accent, opacity: 0.2,
        filter: `drop-shadow(0 8px 24px color-mix(in oklab, ${accent} 50%, transparent))`,
      }}>
        <Icon size={224} fill={fill} />
      </Box>

      {/* content */}
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
      {/* cover area */}
      <Box style={{ position: 'relative', height: 132, background: 'var(--mantine-color-dark-7)', display: 'grid', placeItems: 'center' }}>
        <Box style={{ color: 'var(--mantine-color-dark-2)', opacity: 0.4 }}>
          <ListIcon size={24} />
        </Box>
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
      {/* footer */}
      <Box style={{ padding: '13px 14px' }}>
        <Text fw={600} fz={15} style={{ letterSpacing: -0.2 }}>{list.name}</Text>
        <Text fz={11.5} c="dark.3" mt={3} ff="monospace">
          {n !== null ? `${n} ${n === 1 ? 'game' : 'games'}` : '—'}
        </Text>
      </Box>
    </Box>
  )
}

function ListDetailView({
  list: listProp, isOwn, onBack, onRefresh,
}: {
  list: List; isOwn: boolean; onBack: () => void; onRefresh: () => void
}) {
  const [detail, setDetail] = useState<ListDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [renaming, setRenaming] = useState(false)
  const [nm, setNm] = useState(listProp.name)
  const [confirmDel, setConfirmDel] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const isLocked = listProp.type !== 'custom'

  useState(() => {
    getList(listProp.id).then(setDetail).finally(() => setLoading(false))
  })

  const refresh = () => getList(listProp.id).then((d) => { setDetail(d); onRefresh() })
  const removeGame = async (gameId: number) => {
    await removeGamesFromList(listProp.id, [gameId])
    notifications.show({ message: 'Removed from list', color: 'green' })
    refresh()
  }
  const doDelete = async () => {
    await deleteList(listProp.id)
    notifications.show({ message: 'List deleted', color: 'green' })
    onBack(); onRefresh()
  }
  const doRename = async () => {
    await updateList(listProp.id, { name: nm.trim() || listProp.name, description: null, is_public: listProp.is_public })
    notifications.show({ message: 'List renamed', color: 'green' })
    setRenaming(false); onRefresh()
  }
  const doTogglePublic = async () => {
    await updateList(listProp.id, { name: listProp.name, description: null, is_public: !listProp.is_public })
    notifications.show({ message: listProp.is_public ? 'Set to private' : 'Now public', color: 'green' })
    onRefresh()
  }

  return (
    <Container size={1240} px="xl" pb="xl">
      <Anchor
        component="button"
        onClick={onBack}
        mt="xl"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(10,15,31,.5)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999,
          padding: '9px 15px', fontSize: 13, fontWeight: 500,
          color: 'var(--mantine-color-dark-0)', textDecoration: 'none',
        }}
      >
        <ArrowLeftIcon size={16} /> Your profile
      </Anchor>

      <Group justify="space-between" align="flex-start" gap="xl" mt="xl" mb="lg" wrap="wrap">
        <Group gap="md" align="center">
          <Box style={{
            width: 56, height: 56, borderRadius: 'var(--mantine-radius-md)',
            background: 'color-mix(in oklab, var(--mantine-color-violet-5) 18%, transparent)',
            color: 'var(--mantine-color-violet-4)', display: 'grid', placeItems: 'center',
          }}>
            <ListTypeIcon type={listProp.type} />
          </Box>
          <Box>
            {renaming ? (
              <Group gap="xs">
                <TextInput value={nm} autoFocus onChange={(e) => setNm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doRename()} size="sm" />
                <Button size="sm" onClick={doRename}>Save</Button>
              </Group>
            ) : (
              <Title order={1} style={{ letterSpacing: -0.9, fontSize: 30 }}>{listProp.name}</Title>
            )}
            <Group gap="xs" mt={4}>
              <Text fz="sm" c="dark.2" ff="monospace">{detail?.games.length ?? 0} games</Text>
              {isLocked && <><Text c="dark.3">·</Text><Group gap={4}><LockIcon size={12} style={{ color: 'var(--mantine-color-dark-2)' }} /><Text fz="sm" c="dark.2">locked</Text></Group></>}
              {!isLocked && (listProp.is_public
                ? <><Text c="dark.3">·</Text><Group gap={4}><GlobeIcon size={12} style={{ color: '#7CC8E3' }} /><Text fz="sm" c="dark.2">public</Text></Group></>
                : <><Text c="dark.3">·</Text><Text fz="sm" c="dark.2">private</Text></>
              )}
            </Group>
          </Box>
        </Group>

        {isOwn && (
          <Group gap="xs" wrap="wrap">
            <Button size="sm" leftSection={<PlusIcon size={15} />} onClick={() => setAddOpen(true)}>Add games</Button>
            {!isLocked && (
              <>
                <ActionIcon variant="default" size="lg" onClick={() => { setNm(listProp.name); setRenaming((r) => !r) }}>
                  <EditIcon size={15} />
                </ActionIcon>
                <Button variant="default" size="sm" leftSection={listProp.is_public ? <GlobeIcon size={15} /> : <LockIcon size={15} />} onClick={doTogglePublic}>
                  {listProp.is_public ? 'Public' : 'Private'}
                </Button>
                <ActionIcon variant="default" size="lg" color="red" onClick={() => setConfirmDel(true)}>
                  <TrashIcon size={15} />
                </ActionIcon>
              </>
            )}
          </Group>
        )}
      </Group>

      {isLocked && (
        <Group gap="xs" p="sm" mb="md" style={{ background: 'var(--mantine-color-dark-6)', borderRadius: 'var(--mantine-radius-sm)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
          <LockIcon size={14} style={{ color: 'var(--mantine-color-dark-2)' }} />
          <Text fz="sm" c="dark.1">Built-in list — can't be renamed or deleted, but you can add and remove games.</Text>
        </Group>
      )}

      {loading && <Text c="dark.2" mt="xl">Loading games…</Text>}

      {!loading && detail && (
        detail.games.length === 0 ? (
          <Box ta="center" py={64}>
            <Text fw={600} c="dark.1" mb={6}>This list is empty</Text>
            <Text c="dark.2" fz="sm">Add some games to get started.</Text>
            {isOwn && <Button size="sm" mt="md" leftSection={<PlusIcon size={15} />} onClick={() => setAddOpen(true)}>Add games</Button>}
          </Box>
        ) : (
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5 }} spacing="md" mt="md">
            {detail.games.map((g) => (
              <Box key={g.game_id} className="removable">
                <GameCard id={g.game_id} name={g.name} imageUrl={g.background_image} metacritic={g.metacritic} released={g.released} showWish={false} />
                {isOwn && (
                  <ActionIcon
                    className="remove-btn"
                    variant="filled"
                    color="dark"
                    size="sm"
                    radius="xl"
                    onClick={() => removeGame(g.game_id)}
                    style={{ background: 'rgba(10,15,31,.7)', backdropFilter: 'blur(6px)' }}
                  >
                    <XIcon size={14} />
                  </ActionIcon>
                )}
              </Box>
            ))}
          </SimpleGrid>
        )
      )}

      <Box h={60} />

      {addOpen && (
        <Modal opened onClose={() => setAddOpen(false)} title={`Add games to "${listProp.name}"`} size="md">
          <GamePickerModal
            listId={listProp.id}
            currentGameIds={(detail?.games ?? []).map((g) => g.game_id)}
            onClose={() => setAddOpen(false)}
            onRefresh={refresh}
          />
        </Modal>
      )}

      <Modal opened={confirmDel} onClose={() => setConfirmDel(false)} title="Delete list?" size="sm">
        <Text fz="sm" c="dark.2" mb="md">This can't be undone. The games themselves won't be affected.</Text>
        <Group gap="xs">
          <Button variant="default" style={{ flex: 1 }} onClick={() => setConfirmDel(false)}>Cancel</Button>
          <Button color="red" style={{ flex: 1 }} onClick={doDelete}>Delete list</Button>
        </Group>
      </Modal>
    </Container>
  )
}

function GamePickerModal({
  listId, currentGameIds, onClose, onRefresh,
}: {
  listId: string; currentGameIds: number[]; onClose: () => void; onRefresh: () => void
}) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Array<{ id: number; name: string; background_image: string | null; released: string | null; genres: Array<{ id: number; name: string; slug: string }>; metacritic: number | null }>>([])
  const [added, setAdded] = useState<number[]>([...currentGameIds])
  const [pending, setPending] = useState<number | null>(null)

  const search = async (val: string) => {
    if (!val.trim()) { setResults([]); return }
    const { getGames } = await import('../../features/games/api/games')
    const data = await getGames({ page: 1, page_size: 20, search: val })
    setResults(data.results.map((g) => ({
      id: g.id, name: g.name, background_image: g.background_image,
      released: g.released, genres: g.genres, metacritic: g.metacritic,
    })))
  }

  const toggle = async (game: typeof results[0]) => {
    setPending(game.id)
    try {
      if (added.includes(game.id)) {
        await removeGamesFromList(listId, [game.id])
        setAdded((prev) => prev.filter((id) => id !== game.id))
      } else {
        const { addGamesToList } = await import('../../features/lists/api/lists')
        await addGamesToList(listId, [{ game_id: game.id, name: game.name, released: game.released, genres: game.genres, metacritic: game.metacritic, background_image: game.background_image }])
        setAdded((prev) => [...prev, game.id])
      }
      onRefresh()
    } catch { notifications.show({ message: 'Failed to update list', color: 'red' }) }
    finally { setPending(null) }
  }

  return (
    <Stack gap="sm">
      <Text fz="sm" c="dark.2">Search and tap to add or remove.</Text>
      <TextInput
        placeholder="Search games…"
        leftSection={<SearchIcon size={16} style={{ color: 'var(--mantine-color-dark-2)' }} />}
        value={q}
        autoFocus
        onChange={(e) => { setQ(e.target.value); search(e.target.value) }}
      />
      <Box style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {results.map((g) => {
          const on = added.includes(g.id)
          return (
            <Box
              key={g.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
                borderRadius: 'var(--mantine-radius-sm)', cursor: 'pointer',
                opacity: pending === g.id ? 0.6 : 1,
                background: on ? 'color-mix(in oklab, var(--mantine-color-violet-5) 12%, transparent)' : 'transparent',
                transition: 'background 0.12s',
              }}
              onClick={() => pending ? undefined : toggle(g)}
            >
              <Box
                style={{
                  width: 34, height: 44, borderRadius: 6, flexShrink: 0,
                  backgroundImage: g.background_image ? `url(${g.background_image})` : undefined,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  background: g.background_image ? undefined : 'var(--mantine-color-dark-5)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              />
              <Text fz="sm" fw={500} style={{ flex: 1 }}>
                {g.name}
                <Text fz="xs" c="dark.2" fw={400}>{g.released?.slice(0, 4)} · {g.genres.map((x) => x.name).join(', ')}</Text>
              </Text>
              <Badge
                variant={on ? 'filled' : 'outline'}
                color={on ? 'violet' : 'gray'}
                size="xs"
                radius="xl"
              >
                {on ? 'Added' : 'Add'}
              </Badge>
            </Box>
          )
        })}
        {q && results.length === 0 && (
          <Text ta="center" c="dark.2" fz="sm" py="xl">No results for "{q}"</Text>
        )}
      </Box>
      <Button fullWidth onClick={onClose}>Done</Button>
    </Stack>
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
      styles={{
        title: { fontSize: 22, fontWeight: 700, letterSpacing: -0.5 },
      }}
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
            styles={{
              input: {
                background: 'var(--mantine-color-dark-7)',
                border: '1px solid rgba(255,255,255,0.10)',
              },
            }}
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

import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useContext, useRef, useEffect, useMemo } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useMediaQuery } from '@mantine/hooks'
import {
  Box, Text, Title, Group, Stack, Button, SimpleGrid,
  Container, TextInput, Select, Modal, ActionIcon, Loader, Menu, BackgroundImage,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  listDetailQueryOptions, listsQueryOptions,
  deleteList, updateList, removeGamesFromList, addGamesToList,
} from '../../../../features/lists/api/lists'
import type { ListDetail } from '../../../../features/lists/api/schemas'
import { AuthContext } from '../../../../features/auth/providers/auth_provider'
import GameCard from '../../../../features/games/components/game_card'
import {
  EditIcon, PlusIcon, ListIcon, HeartIcon, PlayIcon,
  GlobeIcon, LockIcon, XIcon, TrashIcon, ArrowLeftIcon, SearchIcon, DotsIcon, ShuffleIcon,
} from '../../../../features/shared/icons'
import PlayraLoader from '../../../../features/shared/playra_loader'

export const Route = createFileRoute('/profile/$id/lists/$listId')({
  component: RouteComponent,
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(listDetailQueryOptions(params.listId)),
  pendingComponent: () => <PlayraLoader />,
})

const TYPE_ACCENT: Record<string, string> = {
  wishlist: '#F498C8',
  ratings: '#F0C36B',
}

function ListTypeIcon({ type }: { type: string }) {
  if (type === 'wishlist') return <HeartIcon size={18} />
  if (type === 'ratings') return <PlayIcon size={18} />
  return <ListIcon size={18} />
}

function RouteComponent() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { profile: currentUser } = useContext(AuthContext)
  const isOwn = currentUser?.id === params.id

  const { data: detail, refetch } = useSuspenseQuery(listDetailQueryOptions(params.listId))

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [togglingPublic, setTogglingPublic] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [sortOrder, setSortOrder] = useState('rating-desc')
  const isMobile = useMediaQuery('(max-width: 48em)')

  const isRatingsList = detail.type === 'ratings'
  const displayedGames = useMemo(() => {
    let games = [...detail.games]
    if (isRatingsList && searchQ.trim()) {
      const q = searchQ.toLowerCase()
      games = games.filter((g) => g.name.toLowerCase().includes(q))
    }
    if (isRatingsList) {
      games.sort((a, b) => {
        if (sortOrder === 'rating-asc') return (a.user_rating ?? 99) - (b.user_rating ?? 99)
        if (sortOrder === 'name-asc') return a.name.localeCompare(b.name)
        if (sortOrder === 'name-desc') return b.name.localeCompare(a.name)
        return (b.user_rating ?? -1) - (a.user_rating ?? -1)
      })
    }
    return games
  }, [detail.games, isRatingsList, searchQ, sortOrder])

  const isLocked = detail.type !== 'custom'

  const refresh = () => {
    refetch()
    qc.invalidateQueries(listsQueryOptions())
  }

  const removeGame = async (gameId: number) => {
    await removeGamesFromList(detail.id, [gameId])
    notifications.show({ title: 'Removed', message: 'Game removed from list', color: 'green' })
    refresh()
  }

  const doDelete = async () => {
    await deleteList(detail.id)
    notifications.show({ title: 'Deleted', message: 'List has been deleted', color: 'green' })
    qc.invalidateQueries(listsQueryOptions())
    navigate({ to: '/profile/$id', params: { id: params.id } })
  }

  const doTogglePublic = async () => {
    setTogglingPublic(true)
    try {
      await updateList(detail.id, { name: detail.name, description: detail.description ?? null, is_public: !detail.is_public })
      notifications.show({ title: 'Visibility updated', message: detail.is_public ? 'List is now private' : 'List is now public', color: 'green' })
      refresh()
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to update visibility', color: 'red' })
    } finally {
      setTogglingPublic(false)
    }
  }

  return (
    <Box>
      <Box style={{ position: 'relative', height: isMobile ? 160 : 220 }}>
        {detail.cover_url ? (
          <BackgroundImage src={detail.cover_url} pos="absolute" inset="0">
            <Box pos="absolute" inset="0" bg="linear-gradient(to bottom, rgba(10,15,31,.3) 0%, rgba(10,15,31,.75) 60%, var(--mantine-color-dark-7) 100%)" />
          </BackgroundImage>
        ) : TYPE_ACCENT[detail.type] ? (
          <>
            <Box pos="absolute" inset="0" style={{ background: `linear-gradient(120deg, color-mix(in oklab, ${TYPE_ACCENT[detail.type]} 26%, transparent) 0%, transparent 58%), linear-gradient(160deg, var(--mantine-color-dark-6) 10%, var(--mantine-color-dark-8) 130%)` }} />
            <Box pos="absolute" inset="0" style={{ opacity: 0.45, backgroundImage: `radial-gradient(color-mix(in oklab, ${TYPE_ACCENT[detail.type]} 30%, transparent) 1px, transparent 1.4px)`, backgroundSize: '22px 22px', WebkitMaskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)', maskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)' }} />
          </>
        ) : (
          <Box
            pos="absolute"
            inset="0"
            style={{ background: 'linear-gradient(135deg, color-mix(in oklab, var(--mantine-color-violet-8) 35%, var(--mantine-color-dark-7)) 0%, var(--mantine-color-dark-7) 100%)' }}
          />
        )}
      </Box>

      <Container size={1440} px="xl" pb="xl">
      <Link
        to="/profile/$id"
        params={{ id: params.id }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(10,15,31,.5)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999,
          padding: '9px 15px', fontSize: 13, fontWeight: 500,
          color: 'var(--mantine-color-dark-0)', textDecoration: 'none',
          marginTop: -20, position: 'relative', zIndex: 10,
        }}
      >
        <ArrowLeftIcon size={16} /> Your profile
      </Link>

      <Group justify="space-between" align="flex-start" gap="xl" mt="xl" mb="lg" wrap="wrap">
        <Group gap="md" align="center">
          <Box style={{
            width: 56, height: 56, borderRadius: 'var(--mantine-radius-md)',
            background: TYPE_ACCENT[detail.type] ? `color-mix(in oklab, ${TYPE_ACCENT[detail.type]} 18%, transparent)` : 'color-mix(in oklab, var(--mantine-color-violet-5) 18%, transparent)',
            color: TYPE_ACCENT[detail.type] ?? 'var(--mantine-color-violet-4)', display: 'grid', placeItems: 'center',
          }}>
            <ListTypeIcon type={detail.type} />
          </Box>
          <Box>
            <Title order={1} style={{ letterSpacing: -0.9, fontSize: 30 }}>{detail.name}</Title>
            <Group gap="xs" mt={4}>
              <Text fz="sm" c="dark.2" ff="monospace">{detail.games.length} games</Text>
              {isLocked && <><Text c="dark.3">·</Text><Group gap={4}><LockIcon size={12} style={{ color: 'var(--mantine-color-dark-2)' }} /><Text fz="sm" c="dark.2">locked</Text></Group></>}
              {!isLocked && (detail.is_public
                ? <><Text c="dark.3">·</Text><Group gap={4}><GlobeIcon size={12} style={{ color: '#7CC8E3' }} /><Text fz="sm" c="dark.2">public</Text></Group></>
                : <><Text c="dark.3">·</Text><Text fz="sm" c="dark.2">private</Text></>
              )}
            </Group>
          </Box>
        </Group>

        {isOwn && (
          <Group gap="xs">
            <Button size="sm" leftSection={<PlusIcon size={15} />} onClick={() => setAddOpen(true)}>
              Add games
            </Button>
            {!isLocked && (
              <Menu shadow="lg" width={200} position="bottom-end" withArrow>
                <Menu.Target>
                  <ActionIcon variant="default" size="lg" aria-label="More options">
                    <DotsIcon size={15} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<EditIcon size={14} />}
                    onClick={() => setEditOpen(true)}
                  >
                    Edit list
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      togglingPublic
                        ? <Loader size={14} color="violet" />
                        : detail.is_public
                          ? <LockIcon size={14} />
                          : <GlobeIcon size={14} />
                    }
                    disabled={togglingPublic}
                    onClick={doTogglePublic}
                  >
                    {detail.is_public ? 'Make private' : 'Make public'}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item leftSection={<TrashIcon size={14} />} color="red" onClick={() => setConfirmDel(true)}>
                    Delete list
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
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

      {isRatingsList && detail.games.length > 0 && (
        <Group gap="sm" mb="md" align="center">
          <TextInput
            placeholder="Search games…"
            leftSection={<SearchIcon size={15} />}
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            size="sm"
            style={{ flex: 1, maxWidth: 280 }}
          />
          <Select
            size="sm"
            value={sortOrder}
            onChange={(v) => v && setSortOrder(v)}
            data={[
              { value: 'rating-desc', label: 'Rating: High → Low' },
              { value: 'rating-asc', label: 'Rating: Low → High' },
              { value: 'name-asc', label: 'Name: A–Z' },
              { value: 'name-desc', label: 'Name: Z–A' },
            ]}
            style={{ width: 190 }}
            allowDeselect={false}
          />
        </Group>
      )}

      {detail.games.length === 0 ? (
        <Box ta="center" py={64}>
          <Text fw={600} c="dark.1" mb={6}>This list is empty</Text>
          <Text c="dark.2" fz="sm">Add some games to get started.</Text>
          {isOwn && <Button size="sm" mt="md" leftSection={<PlusIcon size={15} />} onClick={() => setAddOpen(true)}>Add games</Button>}
        </Box>
      ) : displayedGames.length === 0 ? (
        <Box ta="center" py={64}>
          <Text fw={600} c="dark.1" mb={6}>No results for "{searchQ}"</Text>
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5 }} spacing="md" mt="md">
          {displayedGames.map((g) => (
            <Box key={g.game_id} style={{ position: 'relative' }}>
              <GameCard
                id={g.game_id}
                name={g.name}
                imageUrl={g.background_image}
                metacritic={g.metacritic}
                released={g.released}
                genres={g.genres.map((x) => x.name)}
                communityScore={g.user_rating ?? undefined}
                showWish={false}
              />
              {isOwn && (
                <ActionIcon
                  variant="filled"
                  color="dark"
                  size="sm"
                  radius="xl"
                  onClick={() => removeGame(g.game_id)}
                  style={{
                    position: 'absolute', top: 8, left: 8, zIndex: 10,
                    background: 'rgba(10,15,31,.7)', backdropFilter: 'blur(6px)',
                  }}
                >
                  <XIcon size={14} />
                </ActionIcon>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Box h={60} />

      {addOpen && (
        <Modal opened onClose={() => setAddOpen(false)} title={`Add games to "${detail.name}"`} size="md">
          <GamePickerModal
            listId={detail.id}
            currentGameIds={detail.games.map((g) => g.game_id)}
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

      <EditListModal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        detail={detail}
        onSaved={refresh}
      />
    </Container>
    </Box>
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
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = (val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { getGames } = await import('../../../../features/games/api/games')
        const data = await getGames({ page: 1, page_size: 20, search: val })
        setResults(data.results.map((g) => ({
          id: g.id, name: g.name, background_image: g.background_image,
          released: g.released, genres: g.genres, metacritic: g.metacritic,
        })))
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const toggle = async (game: typeof results[0]) => {
    setPending(game.id)
    try {
      if (added.includes(game.id)) {
        await removeGamesFromList(listId, [game.id])
        setAdded((prev) => prev.filter((id) => id !== game.id))
      } else {
        await addGamesToList(listId, [{ game_id: game.id, name: game.name, released: game.released, genres: game.genres, metacritic: game.metacritic, background_image: game.background_image }])
        setAdded((prev) => [...prev, game.id])
      }
      onRefresh()
    } catch { notifications.show({ title: 'Error', message: 'Failed to update list', color: 'red' }) }
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
        {loading && (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Loader size="sm" color="violet" />
          </Box>
        )}
        {!loading && results.map((g) => {
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
                  backgroundImage: g.background_image ? `url(${g.background_image})` : 'none',
                  backgroundColor: 'var(--mantine-color-dark-5)',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              />
              <Text fz="sm" fw={500} style={{ flex: 1 }}>
                {g.name}
                <Text fz="xs" c="dark.2" fw={400}>{g.released?.slice(0, 4)} · {g.genres.map((x) => x.name).join(', ')}</Text>
              </Text>
              <Box
                style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                  background: on ? 'var(--mantine-color-violet-5)' : 'transparent',
                  color: on ? 'white' : 'var(--mantine-color-dark-2)',
                  border: `1px solid ${on ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
                }}
              >
                {on ? 'Added' : 'Add'}
              </Box>
            </Box>
          )
        })}
        {!loading && q && results.length === 0 && (
          <Text ta="center" c="dark.2" fz="sm" py="xl">No results for "{q}"</Text>
        )}
      </Box>
      <Button fullWidth onClick={onClose}>Done</Button>
    </Stack>
  )
}

function EditListModal({
  opened, onClose, detail, onSaved,
}: {
  opened: boolean
  onClose: () => void
  detail: ListDetail
  onSaved: () => void
}) {
  const [name, setName] = useState(detail.name)
  const [coverUrl, setCoverUrl] = useState(detail.cover_url ?? '')
  const [saving, setSaving] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (opened) {
      setName(detail.name)
      setCoverUrl(detail.cover_url ?? '')
      setImgError(false)
    }
  }, [opened, detail])

  useEffect(() => { setImgError(false) }, [coverUrl])

  const save = async () => {
    setSaving(true)
    try {
      await updateList(detail.id, {
        name: name.trim() || detail.name,
        description: detail.description ?? null,
        is_public: detail.is_public,
        cover_url: coverUrl.trim() || null,
      })
      notifications.show({ title: 'Saved', message: 'List updated', color: 'green' })
      onSaved()
      onClose()
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to save changes', color: 'red' })
    } finally {
      setSaving(false)
    }
  }

  const previewUrl = coverUrl.trim() && !imgError ? coverUrl.trim() : null

  return (
    <Modal opened={opened} onClose={onClose} title="Edit list" size="sm">
      <Stack gap="md">
        <TextInput
          label="Name"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && save()}
        />

        <Box>
          <Text fz="xs" fw={500} c="dark.1" mb={6}>Cover image</Text>
          <Box
            style={{
              height: 100, borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden',
              marginBottom: 8, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              background: previewUrl ? undefined
                : 'linear-gradient(135deg, color-mix(in oklab, var(--mantine-color-violet-8) 40%, var(--mantine-color-dark-6)) 0%, var(--mantine-color-dark-6) 100%)',
              display: 'grid', placeItems: 'center',
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="cover preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={() => setImgError(true)}
              />
            ) : (
              <Box style={{ color: 'var(--mantine-color-violet-4)', opacity: 0.4 }}>
                <ListIcon size={28} />
              </Box>
            )}
          </Box>
          <Group gap={6} align="flex-end">
            <TextInput
              placeholder="https://example.com/image.jpg"
              value={coverUrl}
              style={{ flex: 1 }}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
            <ActionIcon
              variant="default"
              size="lg"
              title="Generate random cover"
              onClick={() => {
                const seed = Math.random().toString(36).slice(2, 10)
                const colors = '7c3aed,8b5cf6,6d28d9,4f46e5,6366f1,3b82f6,2563eb,0284c7,06b6d4,0891b2,7cc8e3,0d9488,14b8a6,7e22ce,c026d3,db2777'
                setCoverUrl(`https://api.dicebear.com/10.x/glass/svg?seed=${seed}&backgroundColor=${colors}&backgroundColorFill=linear`)
              }}
            >
              <ShuffleIcon size={15} />
            </ActionIcon>
          </Group>
          {coverUrl.trim() && imgError && (
            <Text fz="xs" c="red.4" mt={4}>Image couldn't load — check the URL</Text>
          )}
        </Box>

        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={save}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

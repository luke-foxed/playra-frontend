import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useContext } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box, Text, Title, Group, Stack, Button, SimpleGrid,
  Container, Anchor, TextInput, Modal, ActionIcon,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  listDetailQueryOptions, listsQueryOptions,
  deleteList, updateList, removeGamesFromList, addGamesToList,
} from '../../../../features/lists/api/lists'
import { AuthContext } from '../../../../features/auth/providers/auth_provider'
import GameCard from '../../../../features/games/components/game_card'
import {
  EditIcon, PlusIcon, ListIcon, HeartIcon, PlayIcon,
  GlobeIcon, LockIcon, XIcon, TrashIcon, ArrowLeftIcon, SearchIcon,
} from '../../../../features/shared/icons'
import PlayraLoader from '../../../../features/shared/playra_loader'

export const Route = createFileRoute('/profile/$id/lists/$listId')({
  component: RouteComponent,
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(listDetailQueryOptions(params.listId)),
  pendingComponent: () => <PlayraLoader />,
})

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

  const [renaming, setRenaming] = useState(false)
  const [nm, setNm] = useState(detail.name)
  const [confirmDel, setConfirmDel] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const isLocked = detail.type !== 'custom'

  const refresh = () => {
    refetch()
    qc.invalidateQueries(listsQueryOptions())
  }

  const removeGame = async (gameId: number) => {
    await removeGamesFromList(detail.id, [gameId])
    notifications.show({ message: 'Removed from list', color: 'green' })
    refresh()
  }

  const doDelete = async () => {
    await deleteList(detail.id)
    notifications.show({ message: 'List deleted', color: 'green' })
    qc.invalidateQueries(listsQueryOptions())
    navigate({ to: '/profile/$id/', params: { id: params.id } })
  }

  const doRename = async () => {
    await updateList(detail.id, { name: nm.trim() || detail.name, description: null, is_public: detail.is_public })
    notifications.show({ message: 'List renamed', color: 'green' })
    setRenaming(false)
    refresh()
  }

  const doTogglePublic = async () => {
    await updateList(detail.id, { name: detail.name, description: null, is_public: !detail.is_public })
    notifications.show({ message: detail.is_public ? 'Set to private' : 'Now public', color: 'green' })
    refresh()
  }

  return (
    <Container size={1240} px="xl" pb="xl">
      <Anchor
        component={Link}
        to="/profile/$id"
        params={{ id: params.id }}
        mt="xl"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(10,15,31,.5)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999,
          padding: '9px 15px', fontSize: 13, fontWeight: 500,
          color: 'var(--mantine-color-dark-0)', textDecoration: 'none',
          marginTop: 24,
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
            <ListTypeIcon type={detail.type} />
          </Box>
          <Box>
            {renaming ? (
              <Group gap="xs">
                <TextInput value={nm} autoFocus onChange={(e) => setNm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doRename()} size="sm" />
                <Button size="sm" onClick={doRename}>Save</Button>
              </Group>
            ) : (
              <Title order={1} style={{ letterSpacing: -0.9, fontSize: 30 }}>{detail.name}</Title>
            )}
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
          <Group gap="xs" wrap="wrap">
            <Button size="sm" leftSection={<PlusIcon size={15} />} onClick={() => setAddOpen(true)}>Add games</Button>
            {!isLocked && (
              <>
                <ActionIcon variant="default" size="lg" onClick={() => { setNm(detail.name); setRenaming((r) => !r) }}>
                  <EditIcon size={15} />
                </ActionIcon>
                <Button variant="default" size="sm" leftSection={detail.is_public ? <GlobeIcon size={15} /> : <LockIcon size={15} />} onClick={doTogglePublic}>
                  {detail.is_public ? 'Public' : 'Private'}
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

      {detail.games.length === 0 ? (
        <Box ta="center" py={64}>
          <Text fw={600} c="dark.1" mb={6}>This list is empty</Text>
          <Text c="dark.2" fz="sm">Add some games to get started.</Text>
          {isOwn && <Button size="sm" mt="md" leftSection={<PlusIcon size={15} />} onClick={() => setAddOpen(true)}>Add games</Button>}
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5 }} spacing="md" mt="md">
          {detail.games.map((g) => (
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
    const { getGames } = await import('../../../../features/games/api/games')
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
        {q && results.length === 0 && (
          <Text ta="center" c="dark.2" fz="sm" py="xl">No results for "{q}"</Text>
        )}
      </Box>
      <Button fullWidth onClick={onClose}>Done</Button>
    </Stack>
  )
}

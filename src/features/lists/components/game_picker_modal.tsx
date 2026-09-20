import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@mantine/hooks'
import { Box, Button, Center, Flex, Loader, ScrollArea, Stack, Text, TextInput, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { gamesQueryOptions } from '../../games/api/games'
import type { Game } from '../../games/api/schemas'
import { SearchIcon } from '../../shared/icons'
import { addGamesToList, removeGamesFromList } from '../api/lists'

type Props = {
  listId: string
  currentGameIds: number[]
  onClose: () => void
  onRefresh: () => void
}

export default function GamePickerModal({ listId, currentGameIds, onClose, onRefresh }: Props) {
  const [q, setQ] = useState('')
  const [debouncedQ] = useDebouncedValue(q.trim(), 300)
  // local overrides so the row flips instantly, before the list refetch lands
  const [overrides, setOverrides] = useState<Record<number, boolean>>({})
  const [pending, setPending] = useState<number | null>(null)

  const { data, isFetching } = useQuery({
    ...gamesQueryOptions({ page: 1, page_size: 20, search: debouncedQ }),
    enabled: !!debouncedQ,
  })
  const results = q.trim() ? (data?.results ?? []) : []
  const loading = !!q.trim() && (debouncedQ !== q.trim() || isFetching)

  const isAdded = (id: number) => overrides[id] ?? currentGameIds.includes(id)

  const toggle = async (game: Game) => {
    const add = !isAdded(game.id)
    setPending(game.id)
    try {
      if (add) {
        await addGamesToList(listId, [{
          game_id: game.id, name: game.name, released: game.released, genres: game.genres,
          metacritic: game.metacritic, background_image: game.background_image,
        }])
      } else {
        await removeGamesFromList(listId, [game.id])
      }
      setOverrides((prev) => ({ ...prev, [game.id]: add }))
      onRefresh()
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to update list', color: 'red' })
    } finally {
      setPending(null)
    }
  }

  return (
    <Stack gap="sm">
      <Text fz="sm" c="dark.2">Search and tap to add or remove.</Text>
      <TextInput
        placeholder="Search games…"
        leftSection={<SearchIcon size={16} style={{ color: 'var(--mantine-color-dark-2)' }} />}
        value={q}
        autoFocus
        onChange={(e) => setQ(e.currentTarget.value)}
      />
      <ScrollArea.Autosize mah={360}>
        <Stack gap={2}>
          {loading && <Center py="lg"><Loader size="sm" color="violet" /></Center>}
          {!loading && results.map((g) => {
            const on = isAdded(g.id)
            return (
              <UnstyledButton
                key={g.id}
                disabled={pending !== null}
                onClick={() => toggle(g)}
                px={12}
                py={11}
                bdrs="sm"
                bg={on ? 'color-mix(in oklab, var(--mantine-color-violet-5) 12%, transparent)' : undefined}
                opacity={pending === g.id ? 0.6 : 1}
              >
                <Flex align="center" gap={12}>
                  <Box
                    w={34}
                    h={44}
                    bdrs={6}
                    bg="dark.5"
                    style={{
                      flexShrink: 0,
                      backgroundImage: g.background_image ? `url("${g.background_image}")` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                    }}
                  />
                  <Text fz="sm" fw={500} flex={1}>
                    {g.name}
                    <Text fz="xs" c="dark.2" fw={400}>{g.released?.slice(0, 4)} · {g.genres.map((x) => x.name).join(', ')}</Text>
                  </Text>
                  <Box
                    fz={11}
                    fw={600}
                    px={10}
                    py={3}
                    bdrs={999}
                    bg={on ? 'violet.5' : undefined}
                    c={on ? 'white' : 'dark.2'}
                    style={{ border: `1px solid ${on ? 'transparent' : 'rgba(255,255,255,0.12)'}` }}
                  >
                    {on ? 'Added' : 'Add'}
                  </Box>
                </Flex>
              </UnstyledButton>
            )
          })}
          {!loading && q.trim() && results.length === 0 && (
            <Text ta="center" c="dark.2" fz="sm" py="xl">No results for "{q}"</Text>
          )}
        </Stack>
      </ScrollArea.Autosize>
      <Button fullWidth onClick={onClose}>Done</Button>
    </Stack>
  )
}

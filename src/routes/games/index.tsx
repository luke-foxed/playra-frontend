import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Box, Text, Title, SimpleGrid, Group, Button, Container,
  Select, Slider, Stack, TextInput, Anchor,
} from '@mantine/core'
import GameCard from '../../features/games/components/game_card'
import { gamesQueryOptions } from '../../features/games/api/games'
import { GamesSearchSchema } from '../../features/games/api/schemas'
import routeProtector from '../../lib/route_protector'
import { SearchIcon, FilterIcon, XIcon, ChevronIcon } from '../../features/shared/icons'

export const Route = createFileRoute('/games/')({
  component: RouteComponent,
  beforeLoad: routeProtector,
  validateSearch: GamesSearchSchema.parse,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, context: { queryClient } }) =>
    queryClient.ensureQueryData(gamesQueryOptions(deps)),
  pendingComponent: () => (
    <Container size={1240} px="xl" py="xl">
      <Text c="dark.2">Loading…</Text>
    </Container>
  ),
})

const SORT_OPTIONS = [
  { value: '-rating', label: 'Most popular' },
  { value: '-metacritic', label: 'Highest rated' },
  { value: '-released', label: 'Newest' },
  { value: 'name', label: 'A–Z' },
]

function RouteComponent() {
  const navigate = useNavigate({ from: '/games/' })
  const search = Route.useSearch()
  const { data: games } = useSuspenseQuery(gamesQueryOptions(search))
  const [minScore, setMinScore] = useState(0)
  const ordering = search.ordering ?? '-rating'
  const totalPages = Math.ceil((games.count ?? 0) / (search.page_size ?? 20))

  const applyMinScore = (val: number) => {
    setMinScore(val)
    navigate({ search: (prev) => ({ ...prev, metacritic: val ? `${val},100` : undefined, page: 1 }) })
  }
  const setOrdering = (val: string | null) => {
    if (val) navigate({ search: (prev) => ({ ...prev, ordering: val as typeof ordering, page: 1 }) })
  }
  const setQuery = (val: string) => {
    navigate({ search: (prev) => ({ ...prev, search: val || undefined, page: 1 }) })
  }
  const clearAll = () => {
    setMinScore(0)
    navigate({ search: { page: 1, page_size: search.page_size ?? 20 } })
  }

  const hasFilters = minScore > 0 || !!search.search

  return (
    <Container size={1240} px="xl" pb="xl">
      {/* Header */}
      <Group justify="space-between" align="center" pt="xl" pb="xl" wrap="wrap" gap="md">
        <Title order={1} style={{ letterSpacing: -1, fontSize: 34 }}>Browse games</Title>
        <TextInput
          placeholder="Search games or studios…"
          leftSection={<SearchIcon size={18} style={{ color: 'var(--mantine-color-dark-2)' }} />}
          rightSection={search.search ? (
            <Box style={{ cursor: 'pointer', display: 'grid', color: 'var(--mantine-color-dark-2)' }} onClick={() => setQuery('')}>
              <XIcon size={15} />
            </Box>
          ) : undefined}
          defaultValue={search.search ?? ''}
          onChange={(e) => setQuery(e.target.value)}
          radius="xl"
          size="md"
          style={{ minWidth: 340, maxWidth: 440, flex: 1 }}
        />
      </Group>

      <Group align="flex-start" gap="xl" wrap="nowrap">
        {/* SIDEBAR */}
        <Stack
          gap="lg"
          style={{ width: 244, flexShrink: 0, position: 'sticky', top: 88 }}
        >
          <Group justify="space-between" pb="sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Group gap={8}>
              <FilterIcon size={16} />
              <Text fw={600} fz="sm">Filters</Text>
            </Group>
            {hasFilters && (
              <Anchor component="button" fz="sm" c="violet" onClick={clearAll}>Clear all</Anchor>
            )}
          </Group>

          <Box>
            <Text fz="xs" tt="uppercase" style={{ letterSpacing: 1.4 }} c="dark.2" fw={600} mb="sm">
              Min critic score{minScore ? ` · ${minScore}` : ''}
            </Text>
            <Slider
              value={minScore}
              onChange={applyMinScore}
              min={0}
              max={95}
              step={5}
              color="violet"
              label={(v) => v || 'Any'}
            />
            <Group justify="space-between" mt={6}>
              <Text fz="xs" c="dark.2" ff="monospace">Any</Text>
              <Text fz="xs" c="dark.2" ff="monospace">95</Text>
            </Group>
          </Box>
        </Stack>

        {/* RESULTS */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" mb="md">
            <Text fz="sm" c="dark.2" ff="monospace">{games.count} {games.count === 1 ? 'game' : 'games'}</Text>
            <Group gap="sm">
              <Text fz="sm" c="dark.2">Sort</Text>
              <Select
                data={SORT_OPTIONS}
                value={ordering}
                onChange={setOrdering}
                size="xs"
                radius="xl"
                style={{ width: 160 }}
              />
            </Group>
          </Group>

          {games.results.length === 0 ? (
            <Box ta="center" py={64}>
              <Text fw={600} fz="md" c="dark.1" mb={6}>No games match those filters</Text>
              <Text c="dark.2" fz="sm">Try removing a filter or searching something else.</Text>
              <Button variant="light" size="sm" mt="md" onClick={clearAll}>Reset everything</Button>
            </Box>
          ) : (
            <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5 }} spacing="md">
              {games.results.map((g) => (
                <GameCard
                  key={g.id}
                  id={g.id}
                  name={g.name}
                  imageUrl={g.background_image}
                  metacritic={g.metacritic}
                  released={g.released}
                  genres={g.genres.map((x) => x.name)}
                />
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt={40} gap="sm">
              <Button
                variant="outline"
                color="gray"
                size="sm"
                leftSection={<ChevronIcon size={16} style={{ transform: 'rotate(180deg)' }} />}
                disabled={(search.page ?? 1) <= 1}
                onClick={() => navigate({ search: (prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }) })}
              >
                Prev
              </Button>
              <Text fz="sm" c="dark.2" ff="monospace">{search.page ?? 1} / {totalPages}</Text>
              <Button
                variant="outline"
                color="gray"
                size="sm"
                rightSection={<ChevronIcon size={16} />}
                disabled={(search.page ?? 1) >= totalPages}
                onClick={() => navigate({ search: (prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }) })}
              >
                Next
              </Button>
            </Group>
          )}
        </Box>
      </Group>

      <Box h={60} />
    </Container>
  )
}

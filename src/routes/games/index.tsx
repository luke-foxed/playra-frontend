import { createFileRoute } from "@tanstack/react-router"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { Badge, Box, Button, Text, Title, Group, Container, Select, Anchor, Drawer } from "@mantine/core"
import { useEffect, useState } from "react"
import { CloseButton, TextInput } from "@mantine/core"
import { useDebouncedValue, useDisclosure } from "@mantine/hooks"
import { gamesQueryOptions } from "../../features/games/api/games"
import { GamesSearchSchema } from "../../features/games/api/schemas"
import { SORT_OPTIONS } from "../../features/games/constants"
import FilterSidebar from "../../features/games/components/filter_sidebar"
import GameGrid from "../../features/games/components/game_grid"
import { useGamesFilters } from "../../features/games/hooks/useGamesFilters"
import { useUserLibrary } from "../../features/games/hooks/useUserLibrary"
import routeProtector from "../../lib/route_protector"
import { ChevronIcon, FilterIcon, GamepadIcon, SearchIcon } from "../../features/shared/icons"

export const Route = createFileRoute("/games/")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  validateSearch: GamesSearchSchema.parse,
})

function RouteComponent() {
  const search = Route.useSearch()
  const { data: games, isFetching, isLoading } = useQuery({
    ...gamesQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const { wishlistedIds } = useUserLibrary()
  const filters = useGamesFilters(search)

  const [sidebarOpen, { toggle: toggleSidebar }] = useDisclosure(true)
  const [drawerOpen, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  const filterCount = filters.activeFilterCount > 0 && (
    <Badge size="xs" circle variant="gradient" gradient={{ from: "violet.4", to: "violet.6" }}>{filters.activeFilterCount}</Badge>
  )
  const totalPages = Math.ceil((games?.count ?? 0) / (search.page_size ?? 20))

  return (
    <Container size={1440} px="xl" pb={60}>
      <Group justify="space-between" align="flex-start" py="xl" wrap="wrap" gap="md">
        <Box w={{ base: '100%', sm: 'auto' }}>
          <Group gap={12} align="center" mb={4}>
            <Box c="violet.4" display="grid"><GamepadIcon size={26} /></Box>
            <Title order={1} fz={34} style={{ letterSpacing: -1 }}>Browse games</Title>
          </Group>
          <Text c="dimmed" size="sm">Find and explore games from across the library</Text>
        </Box>
        <GamesSearchInput value={search.search} onSearch={filters.setSearch} />
      </Group>

      <Group align="flex-start" gap="xl" wrap="wrap">
        <FilterSidebar open={sidebarOpen} visibleFrom="sm" {...filters.sidebarProps} />

        <Box flex={1} miw={0}>
          <Group justify="space-between" mb="md" align="center">
            <Group gap="sm" align="center">
              <Button
                visibleFrom="sm"
                size="compact-sm"
                radius="xl"
                variant={sidebarOpen ? "light" : "default"}
                leftSection={<FilterIcon size={13} />}
                rightSection={<ChevronIcon size={11} style={{ transform: sidebarOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s ease" }} />}
                onClick={toggleSidebar}
              >
                Filters {filterCount}
              </Button>
              <Button
                hiddenFrom="sm"
                size="compact-sm"
                radius="xl"
                variant="default"
                leftSection={<FilterIcon size={13} />}
                onClick={openDrawer}
              >
                Filters {filterCount}
              </Button>

              <Text fz="sm" c="dark.2" ff="monospace">
                {games?.count ?? "—"} {games?.count === 1 ? "game" : "games"}
              </Text>

              {filters.hasFilters && (
                <Anchor component="button" underline="never" fz="xs" c="violet.4" fw={500} onClick={filters.clearAll}>
                  Clear all
                </Anchor>
              )}
            </Group>

            <Group gap="sm">
              <Text fz="sm" c="dark.2" visibleFrom="xs">Sort</Text>
              <Select
                data={SORT_OPTIONS}
                value={search.ordering ?? "-rating"}
                onChange={(val) => val && filters.setOrdering(val as typeof search.ordering)}
                allowDeselect={false}
                size="xs"
                radius="xl"
                w={180}
              />
            </Group>
          </Group>

          <GameGrid
            games={games}
            isFetching={isFetching}
            isLoading={isLoading}
            totalPages={totalPages}
            currentPage={search.page ?? 1}
            wishlistedIds={wishlistedIds}
            onPageChange={filters.setPage}
            onClearAll={filters.clearAll}
          />
        </Box>
      </Group>

      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        position="bottom"
        size="85%"
        radius="lg"
        title={<Text fw={700} fz={18}>Filters</Text>}
      >
        <FilterSidebar open inDrawer {...filters.sidebarProps} />
      </Drawer>
    </Container>
  )
}

function GamesSearchInput({ value, onSearch }: { value: string | undefined; onSearch: (term: string | undefined) => void }) {
  const [text, setText] = useState(value ?? "")
  const [debounced] = useDebouncedValue(text, 300)

  useEffect(() => {
    if ((debounced || undefined) !== value) onSearch(debounced || undefined)
    // only react to typing, not to URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  // "clear all" changes the URL; mirror it back into the input
  const [urlValue, setUrlValue] = useState(value)
  if (urlValue !== value) {
    setUrlValue(value)
    if ((value ?? "") !== debounced) setText(value ?? "")
  }

  return (
    <TextInput
      placeholder="Search games or studios…"
      leftSection={<SearchIcon size={18} style={{ color: "var(--mantine-color-dark-2)" }} />}
      rightSection={text ? <CloseButton size="sm" aria-label="Clear search" onClick={() => setText("")} /> : undefined}
      value={text}
      onChange={(e) => setText(e.currentTarget.value)}
      radius="xl"
      size="md"
      maw={440}
      flex={1}
      miw={0}
    />
  )
}

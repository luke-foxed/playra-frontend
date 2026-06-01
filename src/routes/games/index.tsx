import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useState } from "react"
import { Box, Text, Title, Group, Container, Select, TextInput, Anchor, UnstyledButton, Drawer } from "@mantine/core"
import { useMediaQuery, useDisclosure } from "@mantine/hooks"
import { gamesQueryOptions } from "../../features/games/api/games"
import { GamesSearchSchema } from "../../features/games/api/schemas"
import { SORT_OPTIONS } from "../../features/games/constants"
import type { Status } from "../../features/games/constants"
import FilterSidebar from "../../features/games/components/filter_sidebar"
import GameGrid from "../../features/games/components/game_grid"
import { useUserLibrary } from "../../features/games/hooks/useUserLibrary"
import routeProtector from "../../lib/route_protector"
import { SearchIcon, FilterIcon, XIcon, ChevronIcon, GamepadIcon } from "../../features/shared/icons"

export const Route = createFileRoute("/games/")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  validateSearch: GamesSearchSchema.parse,
})

function RouteComponent() {
  const navigate = useNavigate({ from: "/games/" })
  const search = Route.useSearch()
  const { data: games, isFetching, isLoading } = useQuery({
    ...gamesQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const { wishlistedIds } = useUserLibrary()
  const [filtersOpen, setFiltersOpen] = useState(true)
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [drawerOpen, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  const ordering = search.ordering ?? "-rating"
  const currentPage = search.page ?? 1
  const totalPages = Math.ceil((games?.count ?? 0) / (search.page_size ?? 20))
  const minScore = search.metacritic ? parseInt(search.metacritic.split(",")[0]) : 0
  const currentGenres = search.genres ? search.genres.split(",") : []
  const currentPlatforms = search.parent_platforms ? search.parent_platforms.split(",") : []

  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
  const isReleasedPreset = search.dates === `1970-01-01,${today}`
  const isUpcomingPreset = search.dates === `${tomorrow},2030-12-31`
  const currentStatus: Status = !search.dates ? "all" : isReleasedPreset ? "released" : isUpcomingPreset ? "upcoming" : "all"
  const hasCustomDateRange = !!search.dates && !isReleasedPreset && !isUpcomingPreset
  const dateParts = search.dates?.split(",") ?? []
  const dateFrom = hasCustomDateRange ? (dateParts[0]?.slice(0, 4) ?? "") : ""
  const dateTo = hasCustomDateRange ? (dateParts[1]?.slice(0, 4) ?? "") : ""

  const activeFilterCount = [
    currentStatus !== "all" ? 1 : 0,
    currentGenres.length,
    currentPlatforms.length,
    minScore > 0 ? 1 : 0,
    hasCustomDateRange ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const setStatus = (status: Status) => {
    const dates = status === "released" ? `1970-01-01,${today}` : status === "upcoming" ? `${tomorrow},2030-12-31` : undefined
    navigate({ search: (prev) => ({ ...prev, dates, page: 1 }) })
  }

  const handleDateRange = (from: string, to: string) => {
    if (!from && !to) {
      navigate({ search: (prev) => ({ ...prev, dates: undefined, page: 1 }) })
    } else {
      const f = from ? `${from}-01-01` : "1970-01-01"
      const t = to ? `${to}-12-31` : "2030-12-31"
      navigate({ search: (prev) => ({ ...prev, dates: `${f},${t}`, page: 1 }) })
    }
  }

  const toggleGenre = (slug: string) => {
    const next = currentGenres.includes(slug) ? currentGenres.filter((g) => g !== slug) : [...currentGenres, slug]
    navigate({ search: (prev) => ({ ...prev, genres: next.length ? next.join(",") : undefined, page: 1 }) })
  }

  const togglePlatform = (id: string) => {
    const next = currentPlatforms.includes(id) ? currentPlatforms.filter((p) => p !== id) : [...currentPlatforms, id]
    navigate({ search: (prev) => ({ ...prev, parent_platforms: next.length ? next.join(",") : undefined, page: 1 }) })
  }

  const clearAll = () => navigate({ search: { page: 1, page_size: search.page_size ?? 20 } })
  const hasFilters = activeFilterCount > 0 || !!search.search

  const sidebarProps = {
    currentStatus,
    currentGenres,
    currentPlatforms,
    minScore,
    dateFrom,
    dateTo,
    onStatusChange: setStatus,
    onGenreToggle: toggleGenre,
    onPlatformToggle: togglePlatform,
    onMinScoreChange: (val: number) => navigate({ search: (prev) => ({ ...prev, metacritic: val ? `${val},100` : undefined, page: 1 }) }),
    onDateRangeChange: handleDateRange,
  }

  return (
    <Container size={1440} px="xl" pb="xl">
      <Group justify="space-between" align="flex-start" pt="xl" pb="xl" wrap="wrap" gap="md">
        <Box w={{ base: '100%', sm: 'auto' }}>
          <Group gap={12} align="center" mb={4}>
            <Box style={{ color: 'var(--mantine-color-violet-4)', display: 'grid' }}><GamepadIcon size={26} /></Box>
            <Title order={1} style={{ letterSpacing: -1, fontSize: 34 }}>Browse games</Title>
          </Group>
          <Text c="dimmed" size="sm">Find and explore games from across the library</Text>
        </Box>
        <TextInput
          placeholder="Search games or studios…"
          leftSection={<SearchIcon size={18} style={{ color: "var(--mantine-color-dark-2)" }} />}
          rightSection={
            search.search ? (
              <Box style={{ cursor: "pointer", display: "grid", color: "var(--mantine-color-dark-2)" }} onClick={() => navigate({ search: (prev) => ({ ...prev, search: undefined, page: 1 }) })}>
                <XIcon size={15} />
              </Box>
            ) : undefined
          }
          defaultValue={search.search ?? ""}
          onChange={(e) => navigate({ search: (prev) => ({ ...prev, search: e.target.value || undefined, page: 1 }) })}
          radius="xl"
          size="md"
          style={{ maxWidth: 440, flex: 1, minWidth: 0 }}
        />
      </Group>

      <Group align="flex-start" gap="xl" wrap="wrap">
        {!isMobile && (
          <FilterSidebar open={filtersOpen} {...sidebarProps} />
        )}

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" mb="md" align="center">
            <Group gap="sm" align="center">
              <UnstyledButton
                onClick={() => isMobile ? openDrawer() : setFiltersOpen((o) => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 20,
                  border: `1px solid ${filtersOpen && !isMobile ? "rgba(139,107,255,0.5)" : "rgba(255,255,255,0.09)"}`,
                  background: filtersOpen && !isMobile ? "color-mix(in oklab, #8B6BFF 15%, #131A38)" : "rgba(255,255,255,0.04)",
                  color: filtersOpen && !isMobile ? "#C2B5FF" : "#6B6E97",
                  transition: "all 0.15s ease", fontSize: 12, fontWeight: 600,
                  fontFamily: "'Sora', system-ui, sans-serif", whiteSpace: "nowrap",
                }}>
                <FilterIcon size={13} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Box style={{
                    background: "linear-gradient(135deg, #9B7BFF, #7355E8)", borderRadius: 10,
                    padding: "1px 6px", fontSize: 10, fontWeight: 700, color: "#fff", lineHeight: "16px",
                  }}>
                    {activeFilterCount}
                  </Box>
                )}
                {!isMobile && (
                  <ChevronIcon size={11} style={{ transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }} />
                )}
              </UnstyledButton>

              <Text fz="sm" c="dark.2" ff="monospace">
                {games?.count ?? "—"} {games?.count === 1 ? "game" : "games"}
              </Text>

              {hasFilters && (
                <Anchor component="button" fz="xs" c="violet.4" fw={500} onClick={clearAll} style={{ textDecoration: "none" }}>
                  Clear all
                </Anchor>
              )}
            </Group>

            <Group gap="sm">
              <Text fz="sm" c="dark.2" visibleFrom="xs">Sort</Text>
              <Select
                data={SORT_OPTIONS}
                value={ordering}
                onChange={(val) => { if (val) navigate({ search: (prev) => ({ ...prev, ordering: val as typeof ordering, page: 1 }) }) }}
                size="xs" radius="xl" style={{ width: 180 }}
              />
            </Group>
          </Group>

          <GameGrid
            games={games}
            isFetching={isFetching}
            isLoading={isLoading}
            totalPages={totalPages}
            currentPage={currentPage}
            wishlistedIds={wishlistedIds}
            onPageChange={(p) => navigate({ search: (prev) => ({ ...prev, page: p }) })}
            onClearAll={clearAll}
          />
        </Box>
      </Group>

      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        position="bottom"
        size="85%"
        radius="lg"
        styles={{
          content: { background: 'var(--mantine-color-dark-7)' },
          header: { background: 'var(--mantine-color-dark-7)' },
        }}
        title={<Text fw={700} fz={18}>Filters</Text>}
      >
        <FilterSidebar open={true} inDrawer {...sidebarProps} />
      </Drawer>

      <Box h={60} />
    </Container>
  )
}

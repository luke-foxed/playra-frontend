import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useState } from "react"
import {
  Box,
  Text,
  Title,
  SimpleGrid,
  Group,
  Button,
  Container,
  Select,
  Slider,
  TextInput,
  Anchor,
  Pagination,
  AspectRatio,
  Skeleton,
  UnstyledButton,
} from "@mantine/core"
import GameCard from "../../features/games/components/game_card"
import { gamesQueryOptions } from "../../features/games/api/games"
import { GamesSearchSchema } from "../../features/games/api/schemas"
import routeProtector from "../../lib/route_protector"
import { SearchIcon, FilterIcon, XIcon, ChevronIcon } from "../../features/shared/icons"

export const Route = createFileRoute("/games/")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  validateSearch: GamesSearchSchema.parse,
})

const SORT_OPTIONS = [
  { value: "-rating", label: "Most popular" },
  { value: "-metacritic", label: "Highest rated" },
  { value: "-released", label: "Newest" },
  { value: "name", label: "A–Z" },
]

const GENRES = [
  { label: "Action", slug: "action" },
  { label: "Adventure", slug: "adventure" },
  { label: "Arcade", slug: "arcade" },
  { label: "Cards", slug: "card-games" },
  { label: "Cozy", slug: "casual" },
  { label: "Horror", slug: "horror" },
  { label: "Metroidvania", slug: "indie" },
  { label: "Platformer", slug: "platformer" },
  { label: "Puzzle", slug: "puzzle" },
  { label: "RPG", slug: "role-playing-games" },
  { label: "Racing", slug: "racing" },
  { label: "Roguelike", slug: "roguelike" },
  { label: "Sim", slug: "simulation" },
  { label: "Strategy", slug: "strategy" },
  { label: "Survival", slug: "survival" },
]

const PLATFORMS = [
  { label: "Mobile", id: "4" },
  { label: "PC", id: "1" },
  { label: "PS5", id: "2" },
  { label: "Switch", id: "7" },
  { label: "Xbox", id: "3" },
]

type Status = "all" | "released" | "upcoming"

const chipBase: React.CSSProperties = {
  borderRadius: 20,
  fontSize: 12,
  fontFamily: "'Sora', system-ui, sans-serif",
  cursor: "pointer",
  transition: "all 0.15s ease",
  letterSpacing: "-0.1px",
  lineHeight: 1,
  whiteSpace: "nowrap",
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        ...chipBase,
        padding: "5px 12px",
        fontWeight: active ? 700 : 500,
        border: active ? "1px solid #8B6BFF" : "1px solid rgba(255,255,255,0.18)",
        background: active ? "#8B6BFF" : "rgba(255,255,255,0.06)",
        color: active ? "#fff" : "#B7B8D6",
        boxShadow: active ? "0 0 14px rgba(139,107,255,0.55), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
      }}>
      {label}
    </UnstyledButton>
  )
}

function StatusChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        ...chipBase,
        padding: "6px 14px",
        fontWeight: 700,
        border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.18)",
        background: active ? "linear-gradient(135deg, #9B7BFF, #7355E8)" : "rgba(255,255,255,0.06)",
        color: active ? "#fff" : "#B7B8D6",
        boxShadow: active ? "0 0 18px rgba(139,107,255,0.6), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
      }}>
      {label}
    </UnstyledButton>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Group gap={9} mb={12} align="center">
      <Box style={{ width: 3, height: 13, borderRadius: 2, background: "#7355E8", flexShrink: 0 }} />
      <Text fz="sm" tt="uppercase" fw={700} style={{ letterSpacing: 1.2, color: "#8B8EB8" }}>
        {children}
      </Text>
    </Group>
  )
}

function SkeletonCard() {
  return (
    <Box bg="dark.6" style={{ borderRadius: "var(--mantine-radius-md)", overflow: "hidden" }}>
      <AspectRatio ratio={3 / 4}>
        <Skeleton h="100%" radius={0} />
      </AspectRatio>
      <Box px={12} py={10}>
        <Skeleton h={10} w="35%" mb={8} radius="sm" />
        <Skeleton h={13} w="85%" mb={10} radius="sm" />
        <Group gap={4}>
          <Skeleton h={18} w={32} radius={5} />
          <Skeleton h={18} w={28} radius={5} />
          <Skeleton h={18} w={24} radius={5} />
        </Group>
      </Box>
    </Box>
  )
}

function RouteComponent() {
  const navigate = useNavigate({ from: "/games/" })
  const search = Route.useSearch()
  const {
    data: games,
    isFetching,
    isLoading,
  } = useQuery({
    ...gamesQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const [filtersOpen, setFiltersOpen] = useState(true)

  const ordering = search.ordering ?? "-rating"
  const currentPage = search.page ?? 1
  const totalPages = Math.ceil((games?.count ?? 0) / (search.page_size ?? 20))
  const minScore = search.metacritic ? parseInt(search.metacritic.split(",")[0]) : 0
  const currentGenres = search.genres ? search.genres.split(",") : []
  const currentPlatforms = search.parent_platforms ? search.parent_platforms.split(",") : []
  const currentStatus: Status = !search.dates ? "all" : search.dates.startsWith("2000") ? "released" : "upcoming"

  const activeFilterCount = [currentStatus !== "all" ? 1 : 0, currentGenres.length, currentPlatforms.length, minScore > 0 ? 1 : 0].reduce(
    (a, b) => a + b,
    0,
  )

const setStatus = (status: Status) => {
  const today = new Date().toISOString().slice(0, 10)

  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)

  const tomorrow = tomorrowDate.toISOString().slice(0, 10)

  const dates = status === "released" ? `2000-01-01,${today}` : status === "upcoming" ? `${tomorrow},2030-12-31` : undefined

  navigate({
    search: (prev) => ({
      ...prev,
      dates,
      page: 1,
    }),
  })
}

  const toggleGenre = (slug: string) => {
    const next = currentGenres.includes(slug) ? currentGenres.filter((g) => g !== slug) : [...currentGenres, slug]
    navigate({ search: (prev) => ({ ...prev, genres: next.length ? next.join(",") : undefined, page: 1 }) })
  }

  const togglePlatform = (id: string) => {
    const next = currentPlatforms.includes(id) ? currentPlatforms.filter((p) => p !== id) : [...currentPlatforms, id]
    navigate({ search: (prev) => ({ ...prev, parent_platforms: next.length ? next.join(",") : undefined, page: 1 }) })
  }

  const applyMinScore = (val: number) => {
    navigate({ search: (prev) => ({ ...prev, metacritic: val ? `${val},100` : undefined, page: 1 }) })
  }

  const setOrdering = (val: string | null) => {
    if (val) navigate({ search: (prev) => ({ ...prev, ordering: val as typeof ordering, page: 1 }) })
  }

  const setQuery = (val: string) => {
    navigate({ search: (prev) => ({ ...prev, search: val || undefined, page: 1 }) })
  }

  const clearAll = () => {
    navigate({ search: { page: 1, page_size: search.page_size ?? 20 } })
  }

  const hasFilters = activeFilterCount > 0 || !!search.search

  return (
    <Container size={1440} px="xl" pb="xl">
      <Group justify="space-between" align="center" pt="xl" pb="xl" wrap="wrap" gap="md">
        <Title order={1} style={{ letterSpacing: -1, fontSize: 34 }}>
          Browse games
        </Title>
        <TextInput
          placeholder="Search games or studios…"
          leftSection={<SearchIcon size={18} style={{ color: "var(--mantine-color-dark-2)" }} />}
          rightSection={
            search.search ? (
              <Box style={{ cursor: "pointer", display: "grid", color: "var(--mantine-color-dark-2)" }} onClick={() => setQuery("")}>
                <XIcon size={15} />
              </Box>
            ) : undefined
          }
          defaultValue={search.search ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          radius="xl"
          size="md"
          style={{ minWidth: 340, maxWidth: 440, flex: 1 }}
        />
      </Group>

      <Group align="flex-start" gap="xl" wrap="nowrap">
        {/* SIDEBAR — horizontal slide */}
        <Box
          style={{
            width: filtersOpen ? 248 : 0,
            minWidth: filtersOpen ? 248 : 0,
            overflow: "hidden",
            transition: "width 0.28s ease, min-width 0.28s ease",
            flexShrink: 0,
            position: "sticky",
            top: 88,
            alignSelf: "flex-start",
          }}>
          {/* Inner box at fixed width so content doesn't reflow during animation */}
          <Box style={{ width: 248 }}>
            <Box
              style={{
                background: "#0E1428",
                border: "1px solid rgba(139,107,255,0.18)",
                borderRadius: 16,
                overflow: "hidden",
              }}>
              {/* STATUS */}
              <Box px={18} pt={22} pb={20}>
                <SectionLabel>Status</SectionLabel>
                <Group gap={6}>
                  {(["all", "released", "upcoming"] as Status[]).map((s) => (
                    <StatusChip
                      key={s}
                      label={s.charAt(0).toUpperCase() + s.slice(1)}
                      active={currentStatus === s}
                      onClick={() => setStatus(s)}
                    />
                  ))}
                </Group>
              </Box>

              <Box style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

              {/* GENRE */}
              <Box px={18} pt={20} pb={20}>
                <SectionLabel>Genre</SectionLabel>
                <Box style={{ display: "flex", flexWrap: "wrap", gap: "7px 6px" }}>
                  {GENRES.map((g) => (
                    <FilterChip key={g.slug} label={g.label} active={currentGenres.includes(g.slug)} onClick={() => toggleGenre(g.slug)} />
                  ))}
                </Box>
              </Box>

              <Box style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

              {/* PLATFORM */}
              <Box px={18} pt={20} pb={20}>
                <SectionLabel>Platform</SectionLabel>
                <Box style={{ display: "flex", flexWrap: "wrap", gap: "7px 6px" }}>
                  {PLATFORMS.map((p) => (
                    <FilterChip key={p.id} label={p.label} active={currentPlatforms.includes(p.id)} onClick={() => togglePlatform(p.id)} />
                  ))}
                </Box>
              </Box>

              <Box style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

              {/* MIN CRITIC SCORE */}
              <Box px={18} pt={20} pb={26}>
                <SectionLabel>Min critic score{minScore ? ` · ${minScore}` : ""}</SectionLabel>
                <Slider
                  value={minScore}
                  onChange={applyMinScore}
                  min={0}
                  max={95}
                  step={5}
                  color="violet"
                  label={(v) => v || "Any"}
                  styles={{
                    thumb: { boxShadow: "0 0 10px rgba(139,107,255,0.6)" },
                  }}
                />
                <Group justify="space-between" mt={8}>
                  <Text fz="xs" c="dark.3" ff="monospace">
                    Any
                  </Text>
                  <Text fz="xs" c="dark.3" ff="monospace">
                    95
                  </Text>
                </Group>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* RESULTS */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" mb="md" align="center">
            <Group gap="sm" align="center">
              {/* Filter toggle — always visible */}
              <UnstyledButton
                onClick={() => setFiltersOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: `1px solid ${filtersOpen ? "rgba(139,107,255,0.5)" : "rgba(255,255,255,0.09)"}`,
                  background: filtersOpen ? "color-mix(in oklab, #8B6BFF 15%, #131A38)" : "rgba(255,255,255,0.04)",
                  color: filtersOpen ? "#C2B5FF" : "#6B6E97",
                  transition: "all 0.15s ease",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Sora', system-ui, sans-serif",
                  whiteSpace: "nowrap",
                }}>
                <FilterIcon size={13} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Box
                    style={{
                      background: "linear-gradient(135deg, #9B7BFF, #7355E8)",
                      borderRadius: 10,
                      padding: "1px 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: "16px",
                    }}>
                    {activeFilterCount}
                  </Box>
                )}
                <ChevronIcon
                  size={11}
                  style={{
                    transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease",
                  }}
                />
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
              <Text fz="sm" c="dark.2">
                Sort
              </Text>
              <Select data={SORT_OPTIONS} value={ordering} onChange={setOrdering} size="xs" radius="xl" style={{ width: 160 }} />
            </Group>
          </Group>

          {isLoading ? (
            <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5 }} spacing="md">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </SimpleGrid>
          ) : !games || games.results.length === 0 ? (
            <Box ta="center" py={64}>
              <Text fw={600} fz="md" c="dark.1" mb={6}>
                No games match those filters
              </Text>
              <Text c="dark.2" fz="sm">
                Try removing a filter or searching something else.
              </Text>
              <Button variant="light" size="sm" mt="md" onClick={clearAll}>
                Reset everything
              </Button>
            </Box>
          ) : (
            <Box style={{ opacity: isFetching ? 0.5 : 1, transition: "opacity 0.2s" }}>
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
                    platforms={g.platforms.map((x) => x.platform.slug)}
                    rating={g.rating}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {totalPages > 1 && (
            <Group justify="center" mt={40}>
              <Pagination
                value={currentPage}
                onChange={(p) => navigate({ search: (prev) => ({ ...prev, page: p }) })}
                total={totalPages}
                siblings={1}
                boundaries={1}
                size="sm"
              />
            </Group>
          )}
        </Box>
      </Group>

      <Box h={60} />
    </Container>
  )
}

import { createFileRoute, Link } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useMediaQuery } from "@mantine/hooks"
import { Box, Text, Title, Group, Container, Avatar, SimpleGrid, BackgroundImage, TextInput, Select } from "@mantine/core"
import { listDetailQueryOptions } from "../../features/lists/api/lists"
import routeProtector from "../../lib/route_protector"
import PlayraLoader from "../../features/shared/playra_loader"
import GameCard from "../../features/games/components/game_card"
import { ArrowLeftIcon, ListIcon, SearchIcon } from "../../features/shared/icons"

export const Route = createFileRoute("/lists/$listId")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(listDetailQueryOptions(params.listId)),
  pendingComponent: () => <PlayraLoader />,
})

const TYPE_ACCENT: Record<string, string> = {
  wishlist: '#F498C8',
  ratings: '#F0C36B',
}

function avatarColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return `radial-gradient(circle at 30% 25%, hsl(${h} 80% 68%), hsl(${(h + 40) % 360} 70% 42%))`
}

function RouteComponent() {
  const params = Route.useParams()
  const isMobile = useMediaQuery("(max-width: 48em)")
  const { data: detail } = useSuspenseQuery(listDetailQueryOptions(params.listId))

  const creator = detail.profiles
  const displayName = creator?.username ?? "unknown"

  const [searchQ, setSearchQ] = useState('')
  const [sortOrder, setSortOrder] = useState(detail.type === 'ratings' ? 'rating-desc' : 'name-asc')

  const isRatingsList = detail.type === 'ratings'
  const isWishlist = detail.type === 'wishlist'
  const showControls = !isWishlist && detail.games.length > 0
  const collageImages = (isRatingsList || isWishlist) && !detail.cover_url
    ? detail.games.filter(g => g.background_image).slice(0, 5)
    : []
  const displayedGames = useMemo(() => {
    let games = [...detail.games]
    if (!isWishlist && searchQ.trim()) {
      const q = searchQ.toLowerCase()
      games = games.filter((g) => g.name.toLowerCase().includes(q))
    }
    if (!isWishlist) {
      games.sort((a, b) => {
        if (sortOrder === 'rating-asc') return (a.user_rating ?? 99) - (b.user_rating ?? 99)
        if (sortOrder === 'rating-desc') return (b.user_rating ?? -1) - (a.user_rating ?? -1)
        if (sortOrder === 'name-asc') return a.name.localeCompare(b.name)
        if (sortOrder === 'name-desc') return b.name.localeCompare(a.name)
        return 0
      })
    }
    return games
  }, [detail.games, isWishlist, searchQ, sortOrder])

  return (
    <Box>
      <Box style={{ position: "relative", height: isMobile ? 220 : 340 }}>
        {detail.cover_url ? (
          <BackgroundImage src={detail.cover_url} pos="absolute" inset="0">
            <Box pos="absolute" inset="0" bg="linear-gradient(to bottom, rgba(10,15,31,.3) 0%, rgba(10,15,31,.75) 60%, var(--mantine-color-dark-7) 100%)" />
          </BackgroundImage>
        ) : collageImages.length >= 2 ? (
          <>
            <Box pos="absolute" inset="0" style={{ display: 'flex', overflow: 'hidden' }}>
              {collageImages.map((g) => (
                <Box
                  key={g.game_id}
                  style={{
                    flex: 1,
                    backgroundImage: `url(${g.background_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.6) saturate(1.1)',
                  }}
                />
              ))}
            </Box>
            <Box pos="absolute" inset="0" style={{ background: 'repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.07) 3px 4px)' }} />
            <Box pos="absolute" inset="0" style={{ background: 'linear-gradient(to bottom, rgba(10,15,31,0) 0%, rgba(10,15,31,.5) 35%, rgba(10,15,31,.88) 62%, rgba(10,15,31,1) 78%)' }} />
          </>
        ) : TYPE_ACCENT[detail.type] ? (
          <>
            <Box pos="absolute" inset="0" style={{ background: `linear-gradient(120deg, color-mix(in oklab, ${TYPE_ACCENT[detail.type]} 26%, transparent) 0%, transparent 58%), linear-gradient(160deg, var(--mantine-color-dark-6) 10%, var(--mantine-color-dark-8) 130%)` }} />
            <Box pos="absolute" inset="0" style={{ opacity: 0.45, backgroundImage: `radial-gradient(color-mix(in oklab, ${TYPE_ACCENT[detail.type]} 30%, transparent) 1px, transparent 1.4px)`, backgroundSize: "22px 22px", WebkitMaskImage: "linear-gradient(115deg, #000 0%, transparent 52%)", maskImage: "linear-gradient(115deg, #000 0%, transparent 52%)" }} />
          </>
        ) : (
          <Box
            pos="absolute"
            inset="0"
            style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--mantine-color-violet-8) 35%, var(--mantine-color-dark-7)) 0%, var(--mantine-color-dark-7) 100%)" }}
          />
        )}
      </Box>

      <Container size={1440} px="xl" pb="xl">
      <Link
        to="/lists"
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(10,15,31,.5)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999,
          padding: "9px 15px", fontSize: 13, fontWeight: 500,
          color: "var(--mantine-color-dark-0)", textDecoration: "none",
          marginTop: -20, position: "relative", zIndex: 10,
        }}
      >
        <ArrowLeftIcon size={16} /> Public lists
      </Link>

      <Group gap="md" align="center" mt="xl" mb="lg">
        <Box
          style={{
            width: 56, height: 56, borderRadius: "var(--mantine-radius-md)",
            background: TYPE_ACCENT[detail.type] ? `color-mix(in oklab, ${TYPE_ACCENT[detail.type]} 18%, transparent)` : "color-mix(in oklab, var(--mantine-color-violet-5) 18%, transparent)",
            color: TYPE_ACCENT[detail.type] ?? "var(--mantine-color-violet-4)",
            display: "grid", placeItems: "center",
          }}
        >
          <ListIcon size={22} />
        </Box>
        <Box>
          <Title order={1} style={{ letterSpacing: -0.9, fontSize: 30 }}>{detail.name}</Title>
          <Group gap="xs" mt={4}>
            <Text fz="sm" c="dark.2" ff="monospace">{detail.games.length} games</Text>
            <Text c="dark.3">·</Text>
            <Group gap={6}>
              <Text fz="sm" c="dark.2">by</Text>
              <Link
                to="/profile/$id"
                params={{ id: detail.created_by ?? "" }}
                style={{ textDecoration: "none" }}
              >
                <Group gap={6} style={{ cursor: "pointer" }}>
                  <Avatar
                    src={creator?.avatar_url ?? undefined}
                    size={18}
                    radius="xl"
                    style={!creator?.avatar_url ? { background: avatarColor(displayName) } : {}}
                  >
                    {!creator?.avatar_url && displayName[0]?.toUpperCase()}
                  </Avatar>
                  <Text fz="sm" c="violet.4" fw={500}>@{displayName}</Text>
                </Group>
              </Link>
            </Group>
          </Group>
        </Box>
      </Group>

      {showControls && (
        <Box style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: isMobile ? undefined : 'space-between', gap: 8, alignItems: isMobile ? 'stretch' : 'center', marginBottom: 16 }}>
          <TextInput
            placeholder="Search games…"
            leftSection={<SearchIcon size={15} />}
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            size="sm"
            style={isMobile ? { flex: 1 } : { width: 320 }}
          />
          <Select
            size="sm"
            value={sortOrder}
            onChange={(v) => v && setSortOrder(v)}
            data={isRatingsList
              ? [
                  { value: 'rating-desc', label: 'Rating: High → Low' },
                  { value: 'rating-asc', label: 'Rating: Low → High' },
                  { value: 'name-asc', label: 'Name: A–Z' },
                  { value: 'name-desc', label: 'Name: Z–A' },
                ]
              : [
                  { value: 'name-asc', label: 'Name: A–Z' },
                  { value: 'name-desc', label: 'Name: Z–A' },
                ]
            }
            style={isMobile ? { flex: 1 } : { width: 210 }}
            allowDeselect={false}
          />
        </Box>
      )}

      {detail.games.length === 0 ? (
        <Box ta="center" py={64}>
          <Text fw={600} c="dark.1" mb={6}>This list is empty</Text>
        </Box>
      ) : displayedGames.length === 0 ? (
        <Box ta="center" py={64}>
          <Text fw={600} c="dark.1" mb={6}>No results for "{searchQ}"</Text>
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5 }} spacing="md" mt="md">
          {displayedGames.map((g) => (
            <GameCard
              key={g.game_id}
              id={g.game_id}
              name={g.name}
              imageUrl={g.background_image}
              metacritic={g.metacritic}
              released={g.released}
              genres={g.genres.map((x) => x.name)}
              communityScore={g.user_rating ?? undefined}
              showWish={false}
            />
          ))}
        </SimpleGrid>
      )}

      <Box h={60} />
    </Container>
    </Box>
  )
}

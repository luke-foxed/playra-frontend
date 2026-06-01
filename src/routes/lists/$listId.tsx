import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useMediaQuery } from "@mantine/hooks"
import { Box, Text, Title, Group, Container, Avatar, SimpleGrid, BackgroundImage } from "@mantine/core"
import { listDetailQueryOptions } from "../../features/lists/api/lists"
import routeProtector from "../../lib/route_protector"
import PlayraLoader from "../../features/shared/playra_loader"
import GameCard from "../../features/games/components/game_card"
import { ArrowLeftIcon, ListIcon, GlobeIcon } from "../../features/shared/icons"

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

  return (
    <Box>
      <Box style={{ position: "relative", height: isMobile ? 160 : 220 }}>
        {detail.cover_url ? (
          <BackgroundImage src={detail.cover_url} pos="absolute" inset="0">
            <Box pos="absolute" inset="0" bg="linear-gradient(to bottom, rgba(10,15,31,.3) 0%, rgba(10,15,31,.75) 60%, var(--mantine-color-dark-7) 100%)" />
          </BackgroundImage>
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
            <Group gap={4}>
              <GlobeIcon size={12} style={{ color: "#7CC8E3" }} />
              <Text fz="sm" c="dark.2">public</Text>
            </Group>
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

      {detail.games.length === 0 ? (
        <Box ta="center" py={64}>
          <Text fw={600} c="dark.1" mb={6}>This list is empty</Text>
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5 }} spacing="md" mt="md">
          {detail.games.map((g) => (
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

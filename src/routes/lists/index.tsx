import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Box, Text, Title, Group, Container, Avatar, SimpleGrid } from "@mantine/core"
import { publicListsQueryOptions } from "../../features/lists/api/lists"
import type { PublicList } from "../../features/lists/api/schemas"
import routeProtector from "../../lib/route_protector"
import PlayraLoader from "../../features/shared/playra_loader"
import { ListIcon, GlobeIcon } from "../../features/shared/icons"

export const Route = createFileRoute("/lists/")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(publicListsQueryOptions()),
  pendingComponent: () => <PlayraLoader />,
})

function avatarColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return `radial-gradient(circle at 30% 25%, hsl(${h} 80% 68%), hsl(${(h + 40) % 360} 70% 42%))`
}

function PublicListCard({ list }: { list: PublicList }) {
  const creator = list.profiles
  const displayName = creator?.username ?? "unknown"

  return (
    <Link
      to="/lists/$listId"
      params={{ listId: list.id }}
      style={{ textDecoration: "none" }}
    >
      <Box
        style={{
          background: "var(--mantine-color-dark-6)",
          borderRadius: "var(--mantine-radius-md)",
          cursor: "pointer",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
          transition: "transform 0.15s, box-shadow 0.15s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Cover */}
        <Box
          style={{
            height: 80,
            flexShrink: 0,
            background: list.cover_url
              ? `url('${list.cover_url}') center / cover no-repeat var(--mantine-color-dark-5)`
              : "linear-gradient(135deg, color-mix(in oklab, var(--mantine-color-violet-8) 35%, var(--mantine-color-dark-5)) 0%, var(--mantine-color-dark-5) 100%)",
            display: "grid",
            placeItems: "center",
          }}
        >
          {!list.cover_url && (
            <Box style={{ color: "var(--mantine-color-violet-4)", opacity: 0.45 }}>
              <ListIcon size={22} />
            </Box>
          )}
        </Box>

        {/* Info */}
        <Box style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Box style={{ flex: 1 }}>
            <Text fw={600} fz="sm" c="dark.0" lineClamp={2} style={{ lineHeight: 1.3 }}>
              {list.name}
            </Text>
            <Text fz="xs" c="dark.3" mt={3} ff="monospace">
              {list.game_count ?? 0} game{(list.game_count ?? 0) !== 1 ? "s" : ""}
            </Text>
          </Box>

          <Group gap={6}>
            <Avatar
              src={creator?.avatar_url ?? undefined}
              size={18}
              radius="xl"
              style={!creator?.avatar_url ? { background: avatarColor(displayName) } : {}}
            >
              {!creator?.avatar_url && displayName[0]?.toUpperCase()}
            </Avatar>
            <Text fz="xs" c="dark.2">@{displayName}</Text>
          </Group>
        </Box>
      </Box>
    </Link>
  )
}

function RouteComponent() {
  const { data: lists } = useSuspenseQuery(publicListsQueryOptions())

  return (
    <Container size={1440} px="xl" pb="xl" pt="xl">
      <Box mb="xl">
        <Group gap={12} align="center" mb={4}>
          <Box style={{ color: 'var(--mantine-color-violet-4)', display: 'grid' }}><GlobeIcon size={26} /></Box>
          <Title order={1} style={{ letterSpacing: -1, fontSize: 34 }}>Public lists</Title>
        </Group>
        <Text c="dimmed" size="sm">Community-curated game collections</Text>
      </Box>

      {lists.length === 0 ? (
        <Box ta="center" py={64}>
          <Text fw={600} c="dark.1" mb={6}>No public lists yet</Text>
          <Text c="dark.2" fz="sm">Be the first to make a list public.</Text>
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5, lg: 6 }} spacing="md">
          {lists.map((l) => (
            <PublicListCard key={l.id} list={l} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  )
}

import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Box, Text, Title, Group, Container, SimpleGrid, Select } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { publicListsQueryOptions } from "../../features/lists/api/lists"
import routeProtector from "../../lib/route_protector"
import ListCover from "../../features/lists/components/list_cover"
import UserAvatar from "../../features/shared/user_avatar"
import type { PublicList } from "../../features/lists/api/schemas"
import { GlobeIcon } from "../../features/shared/icons"

export const Route = createFileRoute("/lists/")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(publicListsQueryOptions()),
})

function RouteComponent() {
  const { data: lists } = useSuspenseQuery(publicListsQueryOptions())
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const creators = new Map<string, string>()
  for (const l of lists) {
    if (l.profiles?.id) creators.set(l.profiles.id, `@${l.profiles.username ?? "unknown"}`)
  }
  const userOptions = [...creators].map(([value, label]) => ({ value, label }))

  const displayedLists = selectedUser ? lists.filter((l) => l.profiles?.id === selectedUser) : lists

  return (
    <Container size={1440} px="xl" pb="xl" pt="xl">
      <Box mb="xl">
        <Group gap={12} align="center" mb={4}>
          <Box c="violet.4" display="grid"><GlobeIcon size={26} /></Box>
          <Title order={1} fz={34} style={{ letterSpacing: -1 }}>Public lists</Title>
        </Group>
        <Text c="dimmed" size="sm">Community-curated game collections</Text>
      </Box>

      {userOptions.length > 1 && (
        <Group mb="lg" gap="sm" align="center">
          <Select
            placeholder="All users"
            data={userOptions}
            value={selectedUser}
            onChange={setSelectedUser}
            clearable
            w={200}
          />
          {selectedUser && (
            <Text fz="sm" c="dark.2" ff="monospace">
              {displayedLists.length} list{displayedLists.length !== 1 ? "s" : ""}
            </Text>
          )}
        </Group>
      )}

      {displayedLists.length === 0 ? (
        <Box ta="center" py={64}>
          <Text fw={600} c="dark.1" mb={6}>No public lists yet</Text>
          <Text c="dark.2" fz="sm">Be the first to make a list public.</Text>
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5, lg: 6 }} spacing="md">
          {displayedLists.map((l) => <PublicListCard key={l.id} list={l} />)}
        </SimpleGrid>
      )}
    </Container>
  )
}

function PublicListCard({ list }: { list: PublicList }) {
  const { hovered, ref } = useHover<HTMLAnchorElement>()
  const creatorName = list.profiles?.username ?? "unknown"
  const count = list.game_count ?? 0

  return (
    <Link
      ref={ref}
      to="/lists/$listId"
      params={{ listId: list.id }}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        borderRadius: "var(--mantine-radius-md)",
        background: "var(--mantine-color-dark-6)",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.15s, box-shadow 0.15s",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered
          ? "0 16px 36px -18px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,0.14)"
          : "inset 0 0 0 1px rgba(255,255,255,0.07)",
      }}
    >
      <ListCover list={list} height={80} iconSize={64} showPublicBadge={false} />
      <Box px={16} py={14} flex={1} display="flex" style={{ flexDirection: "column", gap: 8 }}>
        <Box flex={1}>
          <Text fw={600} fz="sm" c="dark.0" lh={1.3} lineClamp={2}>{list.name}</Text>
          <Text fz="xs" c="dark.3" mt={3} ff="monospace">{count} game{count !== 1 ? "s" : ""}</Text>
        </Box>
        <Group gap={6}>
          <UserAvatar avatarUrl={list.profiles?.avatar_url ?? null} name={creatorName} size={18} />
          <Text fz="xs" c="dark.2">@{creatorName}</Text>
        </Group>
      </Box>
    </Link>
  )
}

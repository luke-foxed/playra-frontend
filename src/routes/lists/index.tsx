import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { Box, Text, Title, Group, Container, Avatar, SimpleGrid, Select } from "@mantine/core"
import { publicListsQueryOptions } from "../../features/lists/api/lists"
import type { PublicList } from "../../features/lists/api/schemas"
import routeProtector from "../../lib/route_protector"
import PlayraLoader from "../../features/shared/playra_loader"
import { ListIcon, StarIcon, HeartIcon, GlobeIcon } from "../../features/shared/icons"

export const Route = createFileRoute("/lists/")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(publicListsQueryOptions()),
  pendingComponent: () => <PlayraLoader />,
})

const LIST_ACCENT: Record<string, string> = {
  ratings: '#F0C36B',
  wishlist: '#F498C8',
}

function ListTypeGraphic({ type, size }: { type: string; size: number }) {
  if (type === 'ratings') return <StarIcon size={size} fill />
  if (type === 'wishlist') return <HeartIcon size={size} fill />
  return <ListIcon size={size} />
}

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
        {(() => {
          const accent = LIST_ACCENT[list.type]
          return (
            <Box style={{ height: 80, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
              {list.cover_url ? (
                <Box style={{ position: 'absolute', inset: 0, backgroundImage: `url('${list.cover_url}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ) : (
                <>
                  <Box style={{ position: 'absolute', inset: 0, background: accent ? `linear-gradient(120deg, color-mix(in oklab, ${accent} 22%, transparent) 0%, transparent 60%), linear-gradient(160deg, var(--mantine-color-dark-6) 10%, var(--mantine-color-dark-7) 130%)` : 'linear-gradient(135deg, color-mix(in oklab, var(--mantine-color-violet-8) 35%, var(--mantine-color-dark-6)) 0%, var(--mantine-color-dark-7) 100%)' }} />
                  {accent && <Box style={{ position: 'absolute', inset: 0, opacity: 0.35, backgroundImage: `radial-gradient(color-mix(in oklab, ${accent} 35%, transparent) 1px, transparent 1.4px)`, backgroundSize: '18px 18px', WebkitMaskImage: 'linear-gradient(115deg, #000 0%, transparent 55%)', maskImage: 'linear-gradient(115deg, #000 0%, transparent 55%)' }} />}
                  <Box style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', opacity: 0.18, color: accent ?? 'var(--mantine-color-violet-4)' }}>
                    <ListTypeGraphic type={list.type} size={64} />
                  </Box>
                </>
              )}
            </Box>
          )
        })()}

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
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const uniqueUsers = useMemo(() => {
    const seen = new Set<string>()
    return lists
      .filter((l) => l.profiles?.id)
      .reduce<Array<{ value: string; label: string }>>((acc, l) => {
        if (!seen.has(l.profiles!.id)) {
          seen.add(l.profiles!.id)
          acc.push({ value: l.profiles!.id, label: `@${l.profiles!.username ?? "unknown"}` })
        }
        return acc
      }, [])
  }, [lists])

  const displayedLists = selectedUser
    ? lists.filter((l) => l.profiles?.id === selectedUser)
    : lists

  return (
    <Container size={1440} px="xl" pb="xl" pt="xl">
      <Box mb="xl">
        <Group gap={12} align="center" mb={4}>
          <Box style={{ color: 'var(--mantine-color-violet-4)', display: 'grid' }}><GlobeIcon size={26} /></Box>
          <Title order={1} style={{ letterSpacing: -1, fontSize: 34 }}>Public lists</Title>
        </Group>
        <Text c="dimmed" size="sm">Community-curated game collections</Text>
      </Box>

      {lists.length > 0 && uniqueUsers.length > 1 && (
        <Group mb="lg" gap="sm" align="center">
          <Select
            placeholder="All users"
            data={uniqueUsers}
            value={selectedUser}
            onChange={setSelectedUser}
            clearable
            size="sm"
            style={{ width: 200 }}
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
          {displayedLists.map((l) => (
            <PublicListCard key={l.id} list={l} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  )
}

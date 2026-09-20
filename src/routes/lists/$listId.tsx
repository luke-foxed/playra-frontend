import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Group, Text } from "@mantine/core"
import { listDetailQueryOptions } from "../../features/lists/api/lists"
import routeProtector from "../../lib/route_protector"
import BackPill from "../../features/shared/back_pill"
import UserAvatar from "../../features/shared/user_avatar"
import ListDetailView from "../../features/lists/components/list_detail_view"

export const Route = createFileRoute("/lists/$listId")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(listDetailQueryOptions(params.listId)),
})

function RouteComponent() {
  const { listId } = Route.useParams()
  const { data: detail } = useSuspenseQuery(listDetailQueryOptions(listId))
  const count = detail.games.length
  const creatorName = detail.profiles?.username ?? "unknown"

  const creator = (
    <Group gap={6}>
      <UserAvatar avatarUrl={detail.profiles?.avatar_url ?? null} name={creatorName} size={18} />
      <Text fz="sm" c="violet.4" fw={500}>@{creatorName}</Text>
    </Group>
  )

  return (
    <ListDetailView
      key={listId}
      detail={detail}
      back={<BackPill to="/lists">Public lists</BackPill>}
      meta={
        <>
          <Text fz="sm" c="dark.2" ff="monospace">{count} {count === 1 ? "game" : "games"}</Text>
          <Text c="dark.3">·</Text>
          <Group gap={6}>
            <Text fz="sm" c="dark.2">by</Text>
            {detail.created_by ? (
              <Link to="/profile/$id" params={{ id: detail.created_by }} style={{ textDecoration: "none" }}>{creator}</Link>
            ) : creator}
          </Group>
        </>
      }
    />
  )
}

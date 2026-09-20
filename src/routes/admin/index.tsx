import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useContext } from "react"
import { Avatar, Badge, Box, Container, Group, Loader, Paper, Select, Table, Text, Title } from "@mantine/core"
import { adminGuard } from "../../lib/route_protector"
import { adminUsersQueryOptions } from "../../features/admin/api/admin"
import useUpdateUserRole from "../../features/admin/hooks/useUpdateUserRole"
import type { AdminUser, UserRole } from "../../features/admin/api/schemas"
import { AuthContext } from "../../features/auth/providers/auth_provider"
import { ShieldIcon } from "../../features/shared/icons"

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
  beforeLoad: adminGuard,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(adminUsersQueryOptions()),
})

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "violet",
  active: "green",
  pending: "yellow",
  suspended: "red",
}

const ROLE_ORDER: Record<UserRole, number> = { admin: 0, active: 1, pending: 2, suspended: 3 }

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "admin", label: "Admin" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
]

function UserRow({ user, currentUserId }: { user: AdminUser; currentUserId: string }) {
  const { mutate: changeRole, isPending, variables } = useUpdateUserRole()
  const saving = isPending && variables?.userId === user.id
  const displayName = user.username ?? user.email

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={user.avatar_url} size={32} radius="xl" color="violet">
            {displayName[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Text size="sm" fw={500}>{user.username ?? <Text span size="sm" c="dimmed">—</Text>}</Text>
            <Text size="xs" c="dimmed">{user.email}</Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed" ff="monospace">{user.id}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={ROLE_COLORS[user.role]} variant="light" size="sm">{user.role}</Badge>
      </Table.Td>
      <Table.Td>
        {user.id === currentUserId ? (
          <Text size="xs" c="dimmed">Cannot change own role</Text>
        ) : (
          <Group gap="xs" align="center">
            <Select
              size="xs"
              value={user.role}
              data={ROLE_OPTIONS}
              allowDeselect={false}
              onChange={(role) => role && role !== user.role && changeRole({ userId: user.id, role: role as UserRole })}
              disabled={saving}
              w={130}
              styles={{ input: { fontSize: 12 } }}
            />
            {saving && <Loader size="xs" />}
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  )
}

function RouteComponent() {
  const { profile } = useContext(AuthContext)
  const { data: users } = useSuspenseQuery(adminUsersQueryOptions())
  const sortedUsers = [...users].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])

  return (
    <Container size={1440} px="xl" pb="xl" pt="xl">
      <Box pb="xl" mb="md" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Group gap={12} align="center" mb={4}>
          <Box c="violet.4" display="grid"><ShieldIcon size={26} /></Box>
          <Title order={1} fz={34} style={{ letterSpacing: -1 }}>Admin</Title>
        </Group>
        <Text c="dimmed" size="sm">Manage user roles and permissions · {users.length} user{users.length !== 1 ? "s" : ""}</Text>
      </Box>

      <Paper bg="rgba(255,255,255,0.03)" bd="1px solid rgba(255,255,255,0.08)" radius="md" style={{ overflow: "hidden" }}>
        <Table.ScrollContainer minWidth={640}>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th miw={300}>ID</Table.Th>
                <Table.Th>Current Role</Table.Th>
                <Table.Th>Change Role</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedUsers.map((user) => (
                <UserRow key={user.id} user={user} currentUserId={profile?.id ?? ""} />
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {users.length === 0 && <Text ta="center" py="xl" c="dimmed" size="sm">No users found</Text>}
      </Paper>
    </Container>
  )
}

import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { useContext, useState } from "react"
import {
  Box,
  Container,
  Title,
  Text,
  Table,
  Badge,
  Select,
  Group,
  Avatar,
  Loader,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import supabase from "../../lib/supabase_client"
import { getProfile } from "../../features/profile/api/profile"
import { adminUsersQueryOptions, updateUserRole } from "../../features/admin/api/admin"
import useGetAdminUsers from "../../features/admin/hooks/useGetAdminUsers"
import type { AdminUser, UserRole } from "../../features/admin/api/schemas"
import PlayraLoader from "../../features/shared/playra_loader"
import { AuthContext } from "../../features/auth/providers/auth_provider"
import { ShieldIcon } from "../../features/shared/icons"

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } })
    }
    try {
      const profile = await getProfile(session.user.id)
      if (profile.role !== "admin") {
        throw redirect({ to: "/" })
      }
    } catch (error) {
      if (isRedirect(error)) throw error
      throw redirect({ to: "/" })
    }
    return session.user
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(adminUsersQueryOptions()),
  pendingComponent: () => <PlayraLoader />,
})

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "violet",
  active: "green",
  pending: "yellow",
  suspended: "red",
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "admin", label: "Admin" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
]

function UserRow({ user, currentUserId }: { user: AdminUser; currentUserId: string }) {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)

  const handleRoleChange = async (newRole: string | null) => {
    if (!newRole || newRole === user.role) return
    setSaving(true)
    try {
      await updateUserRole(user.id, newRole as UserRole)
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      notifications.show({ title: "Role updated", message: `${user.email} → ${newRole}`, color: "green" })
    } catch {
      notifications.show({ title: "Error", message: "Failed to update role", color: "red" })
    } finally {
      setSaving(false)
    }
  }

  const isSelf = user.id === currentUserId

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={user.avatar_url} size={32} radius="xl" color="violet">
            {(user.username ?? user.email)[0].toUpperCase()}
          </Avatar>
          <Box>
            <Text size="sm" fw={500}>{user.username ?? <Text component="span" size="sm" c="dimmed">—</Text>}</Text>
            <Text size="xs" c="dimmed">{user.email}</Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed" ff="monospace">{user.id}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={ROLE_COLORS[user.role]} variant="light" size="sm">
          {user.role}
        </Badge>
      </Table.Td>
      <Table.Td>
        {isSelf ? (
          <Text size="xs" c="dimmed">Cannot change own role</Text>
        ) : (
          <Group gap="xs" align="center">
            <Select
              size="xs"
              value={user.role}
              data={ROLE_OPTIONS}
              onChange={handleRoleChange}
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
  const { data: users = [], isLoading } = useGetAdminUsers()

  if (isLoading) return <PlayraLoader />

  const sortedUsers = [...users].sort((a, b) => {
    const order = { admin: 0, active: 1, pending: 2, suspended: 3 }
    return order[a.role] - order[b.role]
  })

  return (
    <Box>
      <Container size={1440} px="xl" pb="xl" pt="xl">
        <Box pb="xl" mb="md" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Group gap={12} align="center" mb={4}>
            <Box style={{ color: 'var(--mantine-color-violet-4)', display: 'grid' }}><ShieldIcon size={26} /></Box>
            <Title order={1} style={{ letterSpacing: -1, fontSize: 34 }}>Admin</Title>
          </Group>
          <Text c="dimmed" size="sm">Manage user roles and permissions · {users.length} user{users.length !== 1 ? "s" : ""}</Text>
        </Box>

        <Box
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th style={{ minWidth: 300 }}>ID</Table.Th>
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
          </Box>
          {users.length === 0 && (
            <Text ta="center" py="xl" c="dimmed" size="sm">No users found</Text>
          )}
        </Box>

      </Container>
    </Box>
  )
}

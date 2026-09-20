import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useContext } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { ActionIcon, Button, Group, Loader, Menu, Modal, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  listDetailQueryOptions,
  deleteList, updateList, removeGamesFromList,
} from '../../../../features/lists/api/lists'
import { AuthContext } from '../../../../features/auth/providers/auth_provider'
import { DotsIcon, EditIcon, EyeOffIcon, GlobeIcon, LockIcon, PlusIcon, TrashIcon } from '../../../../features/shared/icons'
import BackPill from '../../../../features/shared/back_pill'
import GamePickerModal from '../../../../features/lists/components/game_picker_modal'
import EditListModal from '../../../../features/lists/components/edit_list_modal'
import ListDetailView from '../../../../features/lists/components/list_detail_view'

export const Route = createFileRoute('/profile/$id/lists/$listId')({
  component: RouteComponent,
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(listDetailQueryOptions(params.listId)),
})

function RouteComponent() {
  const { listId } = Route.useParams()
  return <ListDetailPage key={listId} />
}

function ListDetailPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { profile: currentUser } = useContext(AuthContext)

  const { data: detail } = useSuspenseQuery(listDetailQueryOptions(params.listId))
  const isOwn = !!currentUser && currentUser.id === params.id && (!detail.created_by || detail.created_by === currentUser.id)
  const isLocked = detail.type !== 'custom'

  const [editOpen, { open: openEdit, close: closeEdit }] = useDisclosure(false)
  const [addOpen, { open: openAdd, close: closeAdd }] = useDisclosure(false)
  const [confirmDel, { open: openDelete, close: closeDelete }] = useDisclosure(false)
  const [togglingPublic, setTogglingPublic] = useState(false)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: listDetailQueryOptions(detail.id).queryKey })
    qc.invalidateQueries({ queryKey: ['lists'] })
  }

  const removeGame = async (gameId: number) => {
    try {
      await removeGamesFromList(detail.id, [gameId])
      notifications.show({ title: 'Removed', message: 'Game removed from list', color: 'green' })
      refresh()
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to remove game', color: 'red' })
    }
  }

  const doDelete = async () => {
    try {
      await deleteList(detail.id)
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to delete list', color: 'red' })
      return
    }
    notifications.show({ title: 'Deleted', message: 'List has been deleted', color: 'green' })
    qc.removeQueries({ queryKey: listDetailQueryOptions(detail.id).queryKey })
    qc.invalidateQueries({ queryKey: ['lists'] })
    navigate({ to: '/profile/$id', params: { id: params.id } })
  }

  const doTogglePublic = async () => {
    setTogglingPublic(true)
    try {
      await updateList(detail.id, { name: detail.name, description: detail.description ?? null, cover_url: detail.cover_url, is_public: !detail.is_public })
      notifications.show({ title: 'Visibility updated', message: detail.is_public ? 'List is now private' : 'List is now public', color: 'green' })
      refresh()
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to update visibility', color: 'red' })
    } finally {
      setTogglingPublic(false)
    }
  }

  return (
    <ListDetailView
      detail={detail}
      back={<BackPill to="/profile/$id" params={{ id: params.id }}>{isOwn ? 'Your profile' : 'Profile'}</BackPill>}
      meta={
        <>
          <Text fz="sm" c="dark.2" ff="monospace">
            {detail.games.length} {detail.games.length === 1 ? 'game' : 'games'}
          </Text>
          {isLocked && (
            <>
              <Text c="dark.3">·</Text>
              <Group gap={4}>
                <LockIcon size={12} style={{ color: 'var(--mantine-color-dark-2)' }} />
                <Text fz="sm" c="dark.2">locked</Text>
              </Group>
            </>
          )}
          <Text c="dark.3">·</Text>
          <Group gap={4}>
            {detail.is_public ? <GlobeIcon size={12} /> : <EyeOffIcon size={12} />}
            <Text fz="sm" c="dark.2">{detail.is_public ? 'public' : 'private'}</Text>
          </Group>
        </>
      }
      actions={isOwn && (
        <Group gap="xs" w={{ base: '100%', sm: 'auto' }}>
          <Button size="sm" leftSection={<PlusIcon size={15} />} onClick={openAdd} flex={{ base: 1, sm: 'none' }}>
            Add games
          </Button>
          <Menu shadow="lg" width={200} position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="default" size="lg" aria-label="More options">
                <DotsIcon size={15} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {!isLocked && <Menu.Item leftSection={<EditIcon size={14} />} onClick={openEdit}>Edit list</Menu.Item>}
              <Menu.Item
                leftSection={togglingPublic ? <Loader size={14} color="violet" /> : detail.is_public ? <LockIcon size={14} /> : <GlobeIcon size={14} />}
                disabled={togglingPublic}
                onClick={doTogglePublic}
              >
                {detail.is_public ? 'Make private' : 'Make public'}
              </Menu.Item>
              {!isLocked && (
                <>
                  <Menu.Divider />
                  <Menu.Item leftSection={<TrashIcon size={14} />} color="red" onClick={openDelete}>Delete list</Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      )}
      notice={isLocked && isOwn && (
        <Group gap="xs" p="sm" mb="md" bg="dark.6" bdrs="sm" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
          <LockIcon size={14} style={{ color: 'var(--mantine-color-dark-2)' }} />
          <Text fz="sm" c="dark.1">Built-in list — can't be renamed or deleted, but you can add and remove games.</Text>
        </Group>
      )}
      onRemoveGame={isOwn ? removeGame : undefined}
      onAddGames={isOwn ? openAdd : undefined}
    >
      {addOpen && (
        <Modal opened onClose={closeAdd} title={`Add games to "${detail.name}"`} size="md">
          <GamePickerModal
            listId={detail.id}
            currentGameIds={detail.games.map((g) => g.game_id)}
            onClose={closeAdd}
            onRefresh={refresh}
          />
        </Modal>
      )}

      <Modal opened={confirmDel} onClose={closeDelete} title="Delete list?" size="sm">
        <Text fz="sm" c="dark.2" mb="md">This can't be undone. The games themselves won't be affected.</Text>
        <Group gap="xs">
          <Button variant="default" flex={1} onClick={closeDelete}>Cancel</Button>
          <Button color="red" flex={1} onClick={doDelete}>Delete list</Button>
        </Group>
      </Modal>

      {editOpen && <EditListModal onClose={closeEdit} detail={detail} onSaved={refresh} />}
    </ListDetailView>
  )
}

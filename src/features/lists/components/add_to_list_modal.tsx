import { useState } from 'react'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { Button, Checkbox, Group, Modal, Stack, Text, TextInput, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { GlobeIcon, LockIcon, PlusIcon } from '../../shared/icons'
import { addGamesToList, createList, removeGamesFromList } from '../api/lists'
import type { List, ListGame } from '../api/schemas'

type Props = {
  gameId: number
  gameName: string
  gamePayload: ListGame
  lists: Pick<List, 'id' | 'name' | 'is_public'>[]
  inListIds: string[]
  opened: boolean
  onClose: () => void
  onRefresh: () => void
}

export default function AddToListModal({ gameId, gameName, gamePayload, lists, inListIds, opened, onClose, onRefresh }: Props) {
  const [creating, { open: startCreating, close: stopCreating }] = useDisclosure(false)
  const [pending, setPending] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const form = useForm({
    initialValues: { name: '' },
    validate: { name: (v) => (v.trim() ? null : 'Name is required') },
  })

  const toggle = async (listId: string, isIn: boolean) => {
    setPending(listId)
    try {
      if (isIn) await removeGamesFromList(listId, [gameId])
      else await addGamesToList(listId, [gamePayload])
      onRefresh()
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to update list', color: 'red' })
    } finally {
      setPending(null)
    }
  }

  const create = form.onSubmit(async ({ name }) => {
    if (saving) return
    setSaving(true)
    try {
      const list = await createList({ name: name.trim(), description: null, is_public: false })
      try {
        await addGamesToList(list.id, [gamePayload])
      } catch {
        // list exists but the game didn't make it in — say so instead of "failed to create"
        onRefresh()
        notifications.show({ title: 'List created', message: `"${name.trim()}" created, but adding the game failed`, color: 'yellow' })
        form.reset()
        stopCreating()
        return
      }
      notifications.show({ title: 'List created', message: `"${name.trim()}" created & game added`, color: 'green' })
      onRefresh()
      form.reset()
      stopCreating()
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to create list', color: 'red' })
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <>
          <Text fw={700} fz={19}>Add to list</Text>
          <Text fz="sm" c="dark.2">{gameName}</Text>
        </>
      }
      size="md"
    >
      <Stack gap={2} mb="sm">
        {lists.map((l) => {
          const on = inListIds.includes(l.id)
          return (
            <UnstyledButton
              key={l.id}
              disabled={pending !== null}
              onClick={() => toggle(l.id, on)}
              px={12}
              py={11}
              bdrs="sm"
              opacity={pending === l.id ? 0.6 : 1}
              bg={on ? 'color-mix(in oklab, var(--mantine-color-violet-5) 12%, transparent)' : undefined}
            >
              <Group gap={12} wrap="nowrap">
                <Checkbox checked={on} readOnly tabIndex={-1} color="violet" radius="sm" style={{ pointerEvents: 'none' }} />
                <Text fz="sm" fw={500} flex={1}>{l.name}</Text>
                {l.is_public
                  ? <GlobeIcon size={13} style={{ color: '#7CC8E3' }} />
                  : <LockIcon size={13} style={{ color: 'var(--mantine-color-dark-2)' }} />}
              </Group>
            </UnstyledButton>
          )
        })}
      </Stack>

      {creating ? (
        <form onSubmit={create}>
          <Group gap="xs" mt="sm" align="flex-start" wrap="nowrap">
            <TextInput placeholder="New list name…" flex={1} data-autofocus {...form.getInputProps('name')} />
            <Button type="submit" loading={saving}>Create</Button>
            <Button variant="default" onClick={() => { form.reset(); stopCreating() }}>Cancel</Button>
          </Group>
        </form>
      ) : (
        <Button variant="outline" color="gray" fullWidth mt="sm" leftSection={<PlusIcon size={16} />} onClick={startCreating}>
          Create new list
        </Button>
      )}
    </Modal>
  )
}

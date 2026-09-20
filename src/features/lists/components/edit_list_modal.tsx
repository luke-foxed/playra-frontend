import { useState } from 'react'
import { useForm } from '@mantine/form'
import { ActionIcon, Box, Button, Center, Group, Image, Modal, Stack, Text, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { ListIcon, ShuffleIcon } from '../../shared/icons'
import { updateList } from '../api/lists'
import type { ListDetail } from '../api/schemas'

const AVATAR_COLORS = '7c3aed,8b5cf6,6d28d9,4f46e5,6366f1,3b82f6,2563eb,0284c7,06b6d4,0891b2,7cc8e3,0d9488,14b8a6,7e22ce,c026d3,db2777'

const randomCoverUrl = () => {
  const seed = Math.random().toString(36).slice(2, 10)
  return `https://api.dicebear.com/10.x/glass/svg?seed=${seed}&backgroundColor=${AVATAR_COLORS}&backgroundColorFill=linear`
}

const isHttpUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

type Props = {
  detail: ListDetail
  onClose: () => void
  onSaved: () => void
}

export default function EditListModal({ detail, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const form = useForm({
    initialValues: { name: detail.name, cover_url: detail.cover_url ?? '' },
    validate: {
      name: (v) => (v.trim() ? null : 'Name is required'),
      cover_url: (v) => (!v.trim() || isHttpUrl(v.trim()) ? null : 'Enter a valid http(s) URL'),
    },
  })

  const coverUrl = form.values.cover_url.trim()
  const imgError = !!coverUrl && failedUrl === coverUrl
  const previewUrl = coverUrl && !imgError ? coverUrl : null

  const save = form.onSubmit(async (values) => {
    setSaving(true)
    try {
      await updateList(detail.id, {
        name: values.name.trim(),
        description: detail.description ?? null,
        is_public: detail.is_public,
        cover_url: values.cover_url.trim() || null,
      })
      notifications.show({ title: 'Saved', message: 'List updated', color: 'green' })
      onSaved()
      onClose()
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to save changes', color: 'red' })
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal opened onClose={onClose} title="Edit list" size="sm">
      <form onSubmit={save}>
        <Stack gap="md">
          <TextInput label="Name" data-autofocus {...form.getInputProps('name')} />

          <Box>
            <Text fz="xs" fw={500} c="dark.1" mb={6}>Cover image</Text>
            <Center
              h={100}
              mb={8}
              bdrs="md"
              bg={previewUrl ? undefined : 'linear-gradient(135deg, color-mix(in oklab, var(--mantine-color-violet-8) 40%, var(--mantine-color-dark-6)) 0%, var(--mantine-color-dark-6) 100%)'}
              style={{ overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
            >
              {previewUrl ? (
                <Image src={previewUrl} alt="cover preview" w="100%" h="100%" fit="cover" onError={() => setFailedUrl(coverUrl)} />
              ) : (
                <Box c="violet.4" opacity={0.4}><ListIcon size={28} /></Box>
              )}
            </Center>
            <Group gap={6} align="flex-start" wrap="nowrap">
              <TextInput
                placeholder="https://example.com/image.jpg"
                flex={1}
                {...form.getInputProps('cover_url')}
              />
              <ActionIcon
                variant="default"
                size="lg"
                title="Generate random cover"
                onClick={() => form.setFieldValue('cover_url', randomCoverUrl())}
              >
                <ShuffleIcon size={15} />
              </ActionIcon>
            </Group>
            {imgError && <Text fz="xs" c="red.4" mt={4}>Image couldn't load — check the URL</Text>}
          </Box>

          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

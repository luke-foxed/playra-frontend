import { ActionIcon, Badge, Box, Group, Modal, ScrollArea, Text, Title } from '@mantine/core'
import { XIcon } from '../../shared/icons'
import type { GameDetail } from '../api/schemas'

type Props = {
  game: GameDetail
  opened: boolean
  onClose: () => void
}

export default function GameDescriptionModal({ game, opened, onClose }: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      padding={0}
      withCloseButton={false}
      styles={{ header: { display: 'none' }, body: { padding: 0 }, content: { overflow: 'hidden' } }}
      radius="md"
    >
      {/* Blurred cover banner */}
      <Box pos="relative" h={160} style={{ overflow: 'hidden', flexShrink: 0 }}>
        {game.background_image && (
          <Box
            pos="absolute"
            inset={0}
            style={{
              backgroundImage: `url("${game.background_image}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              filter: 'blur(6px) brightness(0.35)',
              transform: 'scale(1.08)',
            }}
          />
        )}
        <Box pos="absolute" inset={0} bg="linear-gradient(to bottom, rgba(10,15,31,0.2) 0%, rgba(10,15,31,0.92) 100%)" />
        <ActionIcon
          variant="subtle"
          color="gray"
          size="md"
          radius="xl"
          aria-label="Close"
          pos="absolute"
          top={12}
          right={12}
          style={{ zIndex: 1, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <XIcon size={14} />
        </ActionIcon>
        <Box pos="absolute" bottom={0} left={0} right={0} px={24} pb={18}>
          <Group gap={6} mb={8}>
            {game.genres.slice(0, 3).map((g) => (
              <Badge key={g.id} variant="light" color="violet" radius="xl" size="xs">{g.name}</Badge>
            ))}
          </Group>
          <Title order={2} fz={22} lh={1.1} style={{ letterSpacing: -0.6 }}>{game.name}</Title>
        </Box>
      </Box>

      <ScrollArea.Autosize mah={420}>
        <Box p="xl" pt="lg">
          <Text c="dark.1" fz="sm" lh={1.8} style={{ whiteSpace: 'pre-line' }}>{game.description_raw}</Text>
        </Box>
      </ScrollArea.Autosize>
    </Modal>
  )
}

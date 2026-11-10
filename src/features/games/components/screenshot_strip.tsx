import { Box, Button, Group, Image, ScrollArea, Text } from '@mantine/core'
import { PhotoIcon } from '../../shared/icons'
import SectionHeading from '../../shared/section_heading'

export function ScreenshotStack({ screenshots, onOpen }: { screenshots: string[]; onOpen: () => void }) {
  return (
    <Group gap={0} w="fit-content" style={{ cursor: 'pointer' }} onClick={onOpen}>
      {screenshots.slice(0, 4).map((url, i) => (
        <Box
          key={url}
          w={40}
          h={27}
          bdrs={5}
          ml={i === 0 ? 0 : -10}
          pos="relative"
          bd="2px solid var(--mantine-color-dark-7)"
          style={{ overflow: 'hidden', zIndex: 4 - i }}
        >
          <Image src={url} alt="" w="100%" h="100%" fit="cover" />
        </Box>
      ))}
      <Group gap={5} ml={10}>
        <PhotoIcon size={13} style={{ color: 'var(--mantine-color-dark-2)' }} />
        <Text fz="xs" c="dark.2" fw={500}>
          {screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''}
        </Text>
      </Group>
    </Group>
  )
}

type StripProps = {
  gameName: string
  screenshots: string[]
  onOpen: (index: number) => void
}

export default function ScreenshotStrip({ gameName, screenshots, onOpen }: StripProps) {
  return (
    <Box mt={44}>
      <SectionHeading
        icon={<PhotoIcon size={18} />}
        right={
          <Button variant="subtle" color="gray" size="xs" leftSection={<PhotoIcon size={13} />} onClick={() => onOpen(0)}>
            View all
          </Button>
        }
      >
        Screenshots
      </SectionHeading>
      <ScrollArea type="hover" scrollbarSize={4}>
        <Group gap={8} wrap="nowrap" pb={8}>
          {screenshots.map((url, i) => (
            <Box
              key={url}
              onClick={() => onOpen(i)}
              pos="relative"
              w={{ base: 200, sm: 260 }}
              bdrs="md"
              style={{ aspectRatio: '16/9', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
            >
              <Image src={url} alt={`${gameName} screenshot ${i + 1}`} w="100%" h="100%" fit="cover" />
            </Box>
          ))}
        </Group>
      </ScrollArea>
    </Box>
  )
}

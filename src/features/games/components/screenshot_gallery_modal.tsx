import { useEffect, useRef, useState } from 'react'
import { useHotkeys, useMediaQuery } from '@mantine/hooks'
import { ActionIcon, Box, Group, Image, Modal, ScrollArea, Text } from '@mantine/core'
import { ChevronIcon, ChevronLeftIcon, PhotoIcon, XIcon } from '../../shared/icons'
import type { Screenshot } from './screenshot_strip'

type Props = {
  opened: boolean
  onClose: () => void
  screenshots: Screenshot[]
  initialIndex: number
  gameName: string
}

const arrowStyle = { background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }

function NavArrow({ side, onClick, isMobile }: { side: 'left' | 'right'; onClick: () => void; isMobile: boolean }) {
  const Icon = side === 'left' ? ChevronLeftIcon : ChevronIcon
  return (
    <ActionIcon
      variant="filled"
      color="dark"
      radius="xl"
      size={isMobile ? 'md' : 'lg'}
      aria-label={side === 'left' ? 'Previous screenshot' : 'Next screenshot'}
      pos="absolute"
      top="50%"
      {...(side === 'left' ? { left: isMobile ? 20 : 28 } : { right: isMobile ? 20 : 28 })}
      style={{ ...arrowStyle, transform: 'translateY(-50%)' }}
      onClick={onClick}
    >
      <Icon size={isMobile ? 16 : 20} />
    </ActionIcon>
  )
}

export default function ScreenshotGalleryModal({ opened, onClose, screenshots, initialIndex, gameName }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const isMobile = !!useMediaQuery('(max-width: 48em)')
  const thumbRef = useRef<HTMLDivElement>(null)

  const [wasOpened, setWasOpened] = useState(opened)
  if (opened !== wasOpened) {
    setWasOpened(opened)
    if (opened) setIndex(initialIndex)
  }

  useEffect(() => {
    thumbRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [index])

  const prev = () => setIndex((i) => (i - 1 + screenshots.length) % screenshots.length)
  const next = () => setIndex((i) => (i + 1) % screenshots.length)

  useHotkeys([
    ['ArrowLeft', () => { if (opened) prev() }],
    ['ArrowRight', () => { if (opened) next() }],
  ])

  const current = screenshots[index] ?? screenshots[0]
  const multiple = screenshots.length > 1

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={isMobile ? '100%' : '90%'}
      fullScreen={isMobile}
      padding={0}
      withCloseButton={false}
      styles={{
        content: { background: 'rgba(8,10,18,0.97)', backdropFilter: 'blur(24px)' },
        body: { padding: 0 },
        header: { display: 'none' },
      }}
      radius="lg"
    >
      <Group justify="space-between" align="center" p="md" pb="sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Group gap={8}>
          <PhotoIcon size={15} style={{ color: 'var(--mantine-color-dark-3)' }} />
          <Text fz="sm" c="dark.1" fw={500}>{gameName}</Text>
        </Group>
        <Group gap="xs">
          <Text fz="sm" c="dark.3" ff="monospace">{index + 1} / {screenshots.length}</Text>
          <ActionIcon variant="subtle" color="gray" radius="xl" aria-label="Close" onClick={onClose}>
            <XIcon size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Box pos="relative" p="md" pb={multiple ? 'sm' : 'md'}>
        <Box w="100%" bdrs="md" bg="dark.8" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
          <Image src={current.image} alt={`${gameName} screenshot ${index + 1}`} w="100%" h="100%" fit="contain" />
        </Box>
        {multiple && (
          <>
            <NavArrow side="left" onClick={prev} isMobile={isMobile} />
            <NavArrow side="right" onClick={next} isMobile={isMobile} />
          </>
        )}
      </Box>

      {multiple && (
        <ScrollArea type="hover" scrollbarSize={4}>
          <Group gap={6} wrap="nowrap" px="md" pb="md">
            {screenshots.map((shot, i) => (
              <Box
                key={shot.id}
                ref={i === index ? thumbRef : undefined}
                onClick={() => setIndex(i)}
                w={72}
                bdrs={6}
                opacity={i === index ? 1 : 0.45}
                style={{
                  aspectRatio: '16/9',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0,
                  outline: i === index ? '2px solid var(--mantine-color-violet-5)' : '1px solid rgba(255,255,255,0.08)',
                  outlineOffset: i === index ? 2 : 0,
                  transition: 'opacity 0.15s, outline-color 0.1s',
                }}
              >
                <Image src={shot.image} alt="" w="100%" h="100%" fit="cover" />
              </Box>
            ))}
          </Group>
        </ScrollArea>
      )}
    </Modal>
  )
}

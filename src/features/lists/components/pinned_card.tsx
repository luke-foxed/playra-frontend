import { Link } from '@tanstack/react-router'
import { useHover } from '@mantine/hooks'
import { Box, Group, Text } from '@mantine/core'
import { ChevronIcon, HeartIcon, ListIcon, StarIcon } from '../../shared/icons'
import { LIST_ACCENT } from '../constants'
import type { List } from '../api/schemas'

type Meta = { Icon: React.ComponentType<{ size?: number; fill?: boolean }>; fill: boolean; blurb: string }

const PINNED_META: Record<string, Meta> = {
  wishlist: { Icon: HeartIcon, fill: false, blurb: "Games you're itching to play" },
  ratings: { Icon: StarIcon, fill: true, blurb: "Games you've scored & rated" },
}

const passive = { pointerEvents: 'none' } as const

export default function PinnedCard({ list, profileId }: { list: List; profileId: string }) {
  const { hovered, ref } = useHover<HTMLAnchorElement>()
  const { Icon, fill, blurb } = PINNED_META[list.type] ?? { Icon: ListIcon, fill: false, blurb: '' }
  const accent = LIST_ACCENT[list.type] ?? '#B098FF'
  const n = list.game_count ?? null

  return (
    <Link
      ref={ref}
      to="/profile/$id/lists/$listId"
      params={{ id: profileId, listId: list.id }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        minHeight: 188,
        padding: '24px 26px',
        borderRadius: 20,
        background: 'var(--mantine-color-dark-6)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.16s, box-shadow 0.16s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered
          ? `0 24px 52px -24px rgba(0,0,0,.75), inset 0 0 0 1px color-mix(in oklab, ${accent} 55%, transparent)`
          : 'inset 0 0 0 1px rgba(255,255,255,0.12)',
      }}
    >
      <Box
        pos="absolute"
        inset={0}
        style={passive}
        bg={`linear-gradient(120deg, color-mix(in oklab, ${accent} 26%, transparent) 0%, transparent 58%), linear-gradient(160deg, var(--mantine-color-dark-6) 10%, var(--mantine-color-dark-8) 130%)`}
      />
      <Box
        pos="absolute"
        inset={0}
        opacity={0.5}
        style={{
          ...passive,
          backgroundImage: `radial-gradient(color-mix(in oklab, ${accent} 30%, transparent) 1px, transparent 1.4px)`,
          backgroundSize: '22px 22px',
          WebkitMaskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)',
          maskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)',
        }}
      />
      <Box
        pos="absolute"
        w={320}
        h={320}
        right={-36}
        top={-126}
        bdrs="50%"
        bg={`radial-gradient(circle, color-mix(in oklab, ${accent} 52%, transparent) 0%, transparent 66%)`}
        style={{ ...passive, filter: 'blur(4px)' }}
      />
      <Box
        pos="absolute"
        right={-26}
        bottom={-52}
        c={accent}
        opacity={0.2}
        style={{ ...passive, lineHeight: 0, filter: `drop-shadow(0 8px 24px color-mix(in oklab, ${accent} 50%, transparent))` }}
      >
        <Icon size={224} fill={fill} />
      </Box>

      <Box pos="relative" flex={1} display="flex" style={{ zIndex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Group gap={8} mb={9} c={accent} fz={12} fw={700} wrap="nowrap" style={{ letterSpacing: 0.3 }}>
            <Icon size={14} fill={fill} /> {list.name}
          </Group>
          <Text fw={700} fz={18} lh={1.25} maw="17ch" style={{ letterSpacing: -0.4, textWrap: 'balance' }}>{blurb}</Text>
        </Box>
        <Group align="center" gap={8} mt="md">
          <Text fz={13} c="dark.2">
            <Text span fz={17} fw={700} c="dark.0" ff="monospace">{n ?? '—'}</Text> {n === 1 ? 'game' : 'games'}
          </Text>
          <Group
            gap={3}
            ml="auto"
            c={accent}
            fz={12.5}
            fw={600}
            wrap="nowrap"
            opacity={hovered ? 1 : 0}
            style={{ transform: hovered ? 'none' : 'translateX(-4px)', transition: 'opacity 0.16s, transform 0.16s' }}
          >
            Open <ChevronIcon size={13} />
          </Group>
        </Group>
      </Box>
    </Link>
  )
}

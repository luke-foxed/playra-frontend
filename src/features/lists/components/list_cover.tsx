import { Box } from '@mantine/core'
import { GlobeIcon } from '../../shared/icons'
import { LIST_ACCENT } from '../constants'
import type { List } from '../api/schemas'
import ListTypeIcon from './list_type_icon'

type Props = {
  list: List
  height?: number
  iconSize?: number
  showPublicBadge?: boolean
}

export default function ListCover({ list, height = 132, iconSize = 90, showPublicBadge = true }: Props) {
  const accent = LIST_ACCENT[list.type]

  return (
    <Box pos="relative" h={height} style={{ overflow: 'hidden', flexShrink: 0 }}>
      {list.cover_url ? (
        <Box pos="absolute" inset={0} style={{ backgroundImage: `url("${list.cover_url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ) : (
        <>
          <Box
            pos="absolute"
            inset={0}
            bg={accent
              ? `linear-gradient(120deg, color-mix(in oklab, ${accent} 22%, transparent) 0%, transparent 60%), linear-gradient(160deg, var(--mantine-color-dark-6) 10%, var(--mantine-color-dark-8) 130%)`
              : 'linear-gradient(135deg, color-mix(in oklab, var(--mantine-color-violet-8) 30%, var(--mantine-color-dark-7)) 0%, var(--mantine-color-dark-7) 100%)'}
          />
          {accent && (
            <Box
              pos="absolute"
              inset={0}
              opacity={0.35}
              style={{
                backgroundImage: `radial-gradient(color-mix(in oklab, ${accent} 35%, transparent) 1px, transparent 1.4px)`,
                backgroundSize: '18px 18px',
                WebkitMaskImage: 'linear-gradient(115deg, #000 0%, transparent 55%)',
                maskImage: 'linear-gradient(115deg, #000 0%, transparent 55%)',
              }}
            />
          )}
          <Box pos="absolute" right={-10} top="50%" opacity={0.18} c={accent ?? 'violet.4'} style={{ transform: 'translateY(-50%)' }}>
            <ListTypeIcon type={list.type} size={iconSize} fill />
          </Box>
        </>
      )}
      {showPublicBadge && list.is_public && (
        <Box
          pos="absolute"
          top={10}
          right={10}
          px={9}
          py={4}
          bdrs={999}
          c="#7CC8E3"
          fz={10.5}
          fw={600}
          bg="color-mix(in oklab, var(--mantine-color-dark-8) 66%, transparent)"
          style={{
            zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: 0.3,
            backdropFilter: 'blur(6px)', boxShadow: 'inset 0 0 0 1px color-mix(in oklab, #7CC8E3 36%, transparent)',
          }}
        >
          <GlobeIcon size={12} /> Public
        </Box>
      )}
    </Box>
  )
}

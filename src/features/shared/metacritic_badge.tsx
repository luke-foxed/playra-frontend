import { Box, useMantineTheme } from '@mantine/core'
import { MetacriticIcon } from './icons'

type Props = { score: number | null; size?: number }

export default function MetacriticBadge({ score, size = 40 }: Props) {
  const { other: { metascore } } = useMantineTheme()

  const pill = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: Math.round(size * 0.2),
    padding: `${Math.round(size * 0.18)}px ${Math.round(size * 0.28)}px`,
    borderRadius: 999,
    flexShrink: 0,
    fontSize: size * 0.36,
    fontWeight: 600,
    fontFamily: 'var(--mantine-font-family-monospace)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  }

  if (score == null) {
    return (
      <Box style={{
        ...pill,
        background: 'rgba(10,15,31,0.55)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'var(--mantine-color-dark-2)',
      }}>
        <MetacriticIcon size={Math.round(size * 0.42)} />
        TBD
      </Box>
    )
  }

  const { bg } = score >= 88 ? metascore.great : score >= 70 ? metascore.ok : metascore.poor

  return (
    <Box style={{
      ...pill,
      background: `color-mix(in oklab, ${bg} 22%, rgba(10,15,31,0.72))`,
      border: `1px solid color-mix(in oklab, ${bg} 50%, transparent)`,
      color: bg,
    }}>
      <MetacriticIcon size={Math.round(size * 0.42)} />
      {score}
    </Box>
  )
}

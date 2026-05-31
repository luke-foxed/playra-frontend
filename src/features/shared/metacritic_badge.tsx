import { Box } from '@mantine/core'

type Props = { score: number | null; size?: number }

export default function MetacriticBadge({ score, size = 40 }: Props) {
  const base: React.CSSProperties = {
    display: 'inline-grid',
    placeItems: 'center',
    width: size,
    height: size,
    borderRadius: 9,
    fontFamily: 'var(--mantine-font-family-monospace)',
    fontWeight: 600,
    fontSize: size * 0.38,
    flexShrink: 0,
  }

  if (score == null) {
    return (
      <Box style={{ ...base, background: 'var(--mantine-color-dark-5)', color: 'var(--mantine-color-dark-2)', fontSize: 11 }}>
        TBD
      </Box>
    )
  }

  const bg = score >= 88 ? '#7FE6B9' : score >= 70 ? '#F0C36B' : '#FF6B7E'
  const color = score >= 88 ? '#06210f' : score >= 70 ? '#2a1c00' : '#2a0008'

  return (
    <Box style={{ ...base, background: bg, color }}>
      {score}
    </Box>
  )
}

import { Link } from '@tanstack/react-router'
import { Box, Text, AspectRatio, UnstyledButton } from '@mantine/core'
import MetacriticBadge from '../../shared/metacritic_badge'
import { HeartIcon, ClockIcon } from '../../shared/icons'

type Props = {
  id: number
  name: string
  imageUrl: string | null
  metacritic?: number | null
  released?: string | null
  genres?: string[]
  showWish?: boolean
  inWishlist?: boolean
  onWishToggle?: (e: React.MouseEvent) => void
}

export default function GameCard({
  id, name, imageUrl, metacritic, released, genres,
  showWish = true, inWishlist = false, onWishToggle,
}: Props) {
  const year = released?.slice(0, 4)
  const isUpcoming = released ? released > new Date().toISOString().slice(0, 10) : false

  const coverBg: React.CSSProperties = imageUrl
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(160deg, var(--mantine-color-dark-5) 0%, var(--mantine-color-dark-7) 120%)' }

  return (
    <Link to="/games/$id" params={{ id: String(id) }} style={{ textDecoration: 'none', display: 'block' }}>
      <Box style={{ cursor: 'pointer' }}>
        <AspectRatio ratio={3 / 4}>
          <Box
            style={{
              ...coverBg,
              borderRadius: 'var(--mantine-radius-md)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
          >
            <Box style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px)' }} />

            {isUpcoming ? (
              <Box pos="absolute" top={10} left={10}>
                <Box style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'color-mix(in oklab, #7CC8E3 16%, transparent)',
                  color: '#7CC8E3', borderRadius: 999, padding: '5px 11px', fontSize: 12, fontWeight: 500,
                }}>
                  <ClockIcon size={12} /> {year}
                </Box>
              </Box>
            ) : showWish && (
              <UnstyledButton
                pos="absolute"
                top={10}
                left={10}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: inWishlist ? 'color-mix(in oklab, #F498C8 24%, rgba(10,15,31,.6))' : 'rgba(10,15,31,.55)',
                  backdropFilter: 'blur(6px)',
                  display: 'grid', placeItems: 'center',
                  color: inWishlist ? '#F498C8' : 'var(--mantine-color-dark-1)',
                  opacity: inWishlist ? 1 : 0,
                  transition: 'opacity 0.15s',
                }}
                onClick={onWishToggle}
              >
                <HeartIcon size={16} fill={inWishlist} />
              </UnstyledButton>
            )}

            {!isUpcoming && (
              <Box pos="absolute" top={10} right={10}>
                <MetacriticBadge score={metacritic ?? null} size={30} />
              </Box>
            )}

            <Box
              pos="absolute"
              bottom={0}
              left={0}
              right={0}
              style={{
                padding: '14px 13px 13px',
                fontWeight: 700, fontSize: 15, lineHeight: 1.12, letterSpacing: -0.3,
                background: 'linear-gradient(to top, rgba(10,15,31,.92) 10%, transparent)',
                color: '#F4EFE6',
              }}
            >
              {name}
            </Box>
          </Box>
        </AspectRatio>

        <Box px={2} pt="xs">
          <Text fz={12} c="dark.2">
            {year}{genres && genres.length > 0 ? ` · ${genres.slice(0, 2).join(', ')}` : ''}
          </Text>
        </Box>
      </Box>
    </Link>
  )
}

import { Link } from '@tanstack/react-router'
import { useHover } from '@mantine/hooks'
import { Box, AspectRatio, Group, Text, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import MetacriticBadge from '../../shared/metacritic_badge'
import { ClockIcon, HeartIcon, StarIcon, XIcon } from '../../shared/icons'
import useWishlist from '../../lists/hooks/useWishlist'
import { PLATFORM_LABELS } from '../constants'

const PLATFORM_ORDER = Object.fromEntries(PLATFORM_LABELS.map((p, i) => [p.slug, i]))
const PLATFORM_LABEL = Object.fromEntries(PLATFORM_LABELS.map((p) => [p.slug, p.label]))
const platformLabel = (slug: string) => PLATFORM_LABEL[slug] ?? slug.slice(0, 3).toUpperCase()

const MAX_PLATFORMS_DESKTOP = 2
const MAX_PLATFORMS_MOBILE = 1

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  backdropFilter: 'blur(6px)',
  transition: 'all 0.15s',
}

type BadgeProps = {
  inWishlist: boolean
  cardHovered: boolean
  loading: boolean
  onToggle: () => void
}

// Sits inside the card's <Link>, so it has to stop the navigation itself.
function WishlistBadge({ inWishlist, cardHovered, loading, onToggle }: BadgeProps) {
  const { hovered, ref } = useHover<HTMLButtonElement>()
  const removing = inWishlist && hovered
  const tone = removing ? 'red' : 'violet'

  return (
    <UnstyledButton
      ref={ref}
      disabled={loading}
      pos="absolute"
      bottom={10}
      right={10}
      px={10}
      py={4}
      bdrs={999}
      fz={11}
      fw={600}
      c={removing ? 'red.4' : 'violet.3'}
      bg={`color-mix(in oklab, var(--mantine-color-${tone}-${removing ? 7 : 5}) 22%, rgba(10,15,31,.72))`}
      bd={`1px solid color-mix(in oklab, var(--mantine-color-${tone}-${removing ? 5 : 4}) 35%, transparent)`}
      opacity={inWishlist || cardHovered ? 1 : 0}
      style={{
        ...badgeStyle,
        boxShadow: `0 0 14px color-mix(in oklab, var(--mantine-color-${tone}-${removing ? 6 : 5}) ${removing ? 25 : 30}%, transparent)`,
        transform: inWishlist || cardHovered ? 'none' : 'translateY(4px)',
        pointerEvents: loading ? 'none' : undefined,
      }}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
    >
      {inWishlist ? (
        removing ? <><XIcon size={10} /> Remove</> : <><HeartIcon size={10} fill stroke={0} /> Wishlisted</>
      ) : (
        <><HeartIcon size={10} fill={false} stroke={2} /> Wishlist</>
      )}
    </UnstyledButton>
  )
}

type Props = {
  id: number
  name: string
  imageUrl: string | null
  metacritic?: number | null
  released?: string | null
  genres?: string[]
  platforms?: string[]
  communityScore?: number | null
  userScore?: number | null
  showWish?: boolean
  inWishlist?: boolean
}

export default function GameCard({
  id, name, imageUrl, metacritic, released, genres, platforms, communityScore, userScore,
  showWish = true, inWishlist = false,
}: Props) {
  const { hovered, ref } = useHover<HTMLAnchorElement>()
  const { toggleWishlist, isLoading: wishLoading } = useWishlist(id)

  const hasUserScore = userScore != null && userScore > 0
  const displayScore = hasUserScore ? userScore : communityScore
  const year = released?.slice(0, 4)
  const isUpcoming = !!released && dayjs(released).isAfter(dayjs(), 'day')

  const sorted = [...(platforms ?? [])].sort((a, b) => (PLATFORM_ORDER[a] ?? 99) - (PLATFORM_ORDER[b] ?? 99))
  const gamePayload = { game_id: id, name, released: released ?? null, genres: [], metacritic: metacritic ?? null, background_image: imageUrl }
  const toggle = () => toggleWishlist({ inWishlist, gamePayload }).catch(() => {})

  const hoverLayer = (style: React.CSSProperties) => (
    <Box pos="absolute" opacity={hovered ? 1 : 0} style={{ pointerEvents: 'none', transition: 'opacity 0.2s', ...style }} />
  )

  return (
    <Link
      ref={ref}
      to="/games/$id"
      params={{ id: String(id) }}
      style={{
        display: 'block',
        overflow: 'hidden',
        borderRadius: 'var(--mantine-radius-md)',
        background: 'var(--mantine-color-dark-6)',
        textDecoration: 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 12px 32px -8px rgba(0,0,0,.6)' : 'inset 0 0 0 1px rgba(255,255,255,0.07)',
      }}
    >
      <AspectRatio ratio={3 / 4}>
        <Box
          pos="relative"
          bg={imageUrl ? undefined : 'linear-gradient(160deg, var(--mantine-color-dark-5) 0%, var(--mantine-color-dark-7) 120%)'}
          style={{
            overflow: 'hidden',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            ...(imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {}),
          }}
        >
          <Box pos="absolute" inset={0} bg="repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px)" />
          {hoverLayer({ top: 0, left: 0, right: 0, height: '46%', background: 'linear-gradient(to bottom, rgba(10,15,31,.62), transparent)' })}
          {hoverLayer({ bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(10,15,31,.55), transparent)' })}
          {hoverLayer({ inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' })}

          {isUpcoming && (
            <Box
              pos="absolute"
              top={10}
              left={10}
              px={11}
              py={5}
              bdrs={999}
              fz={12}
              fw={500}
              c="#7CC8E3"
              bg="color-mix(in oklab, #7CC8E3 16%, rgba(10,15,31,.6))"
              style={badgeStyle}
            >
              <ClockIcon size={12} /> {year}
            </Box>
          )}

          {showWish && (!isUpcoming || inWishlist) && (
            <WishlistBadge inWishlist={inWishlist} cardHovered={hovered} loading={wishLoading} onToggle={toggle} />
          )}

          {!isUpcoming && (
            <Box pos="absolute" top={10} right={10}>
              <MetacriticBadge score={metacritic ?? null} size={26} />
            </Box>
          )}
        </Box>
      </AspectRatio>

      <Box px={12} py={10}>
        <Text fz={10} tt="uppercase" c="dark.3" fw={700} lineClamp={1} style={{ letterSpacing: 1.4 }}>
          {genres?.[0] ?? '-'}
        </Text>
        <Text fw={700} fz={13} c="dark.0" mt={2} lineClamp={1} lh={1.2} style={{ letterSpacing: -0.2 }}>
          {name}
        </Text>
        <Group justify="space-between" mt={8} align="center" gap={4} wrap="nowrap">
          <Group gap={4} wrap="nowrap">
            {sorted.slice(0, MAX_PLATFORMS_DESKTOP).map((slug, i) => (
              <PlatformPill key={slug} visibleFrom={i >= MAX_PLATFORMS_MOBILE ? 'sm' : undefined}>{platformLabel(slug)}</PlatformPill>
            ))}
            {sorted.length > MAX_PLATFORMS_DESKTOP && (
              <PlatformPill muted visibleFrom="sm">+{sorted.length - MAX_PLATFORMS_DESKTOP}</PlatformPill>
            )}
            {sorted.length > MAX_PLATFORMS_MOBILE && (
              <PlatformPill muted hiddenFrom="sm">+{sorted.length - MAX_PLATFORMS_MOBILE}</PlatformPill>
            )}
            {!sorted.length && year && <Text fz={11} c="dark.3" ff="monospace">{year}</Text>}
          </Group>
          {!isUpcoming && (
            <Group gap={3} wrap="nowrap" style={{ flexShrink: 0 }}>
              <StarIcon
                size={12}
                fill={displayScore != null}
                style={{ color: displayScore != null ? (hasUserScore ? 'var(--mantine-color-violet-4)' : '#F0C36B') : 'var(--mantine-color-dark-4)' }}
              />
              <Text fz={12} fw={600} ff="monospace" c={displayScore != null ? 'dark.1' : 'dark.4'}>
                {displayScore != null ? displayScore.toFixed(1) : '—'}
              </Text>
            </Group>
          )}
        </Group>
      </Box>
    </Link>
  )
}

function PlatformPill({ muted, ...props }: { muted?: boolean; children: React.ReactNode; visibleFrom?: 'sm'; hiddenFrom?: 'sm' }) {
  return <Box component="span" px={6} py={2} bdrs={5} fz={10} fw={600} bg="dark.5" c={muted ? 'dark.2' : 'dark.1'} style={{ flexShrink: 0 }} {...props} />
}

import { Link } from '@tanstack/react-router'
import { Box, AspectRatio, Group, Text } from '@mantine/core'
import { useState } from 'react'
import MetacriticBadge from '../../shared/metacritic_badge'
import { HeartIcon, ClockIcon, StarIcon, XIcon } from '../../shared/icons'
import useAddToWishlist from '../hooks/useAddToWishlist'
import useRemoveFromWishlist from '../hooks/useRemoveFromWishlist'

const PLATFORM: Record<string, string> = {
  'playstation5': 'PS5',
  'xbox-series-x': 'XSX',
  pc: 'PC',
  'nintendo-switch': 'NS',
  'playstation4': 'PS4',
  'xbox-one': 'XB1',
  ios: 'iOS',
  android: 'And',
  mac: 'Mac',
  linux: 'Lin',
}

const PLATFORM_PRIORITY: Record<string, number> = {
  'playstation5': 1,
  'xbox-series-x': 2,
  pc: 3,
  'nintendo-switch': 4,
  'playstation4': 5,
  'xbox-one': 6,
  ios: 7,
  android: 8,
  mac: 9,
  linux: 10,
}

const MAX_PLATFORMS = 2

type Props = {
  id: number
  name: string
  imageUrl: string | null
  metacritic?: number | null
  released?: string | null
  genres?: string[]
  platforms?: string[]
  communityScore?: number | null
  showWish?: boolean
  inWishlist?: boolean
  onWishToggle?: (e: React.MouseEvent) => void
}

export default function GameCard({
  id, name, imageUrl, metacritic, released, genres, platforms, communityScore,
  showWish = true, inWishlist = false, onWishToggle,
}: Props) {
  const displayScore = communityScore
  const [hovered, setHovered] = useState(false)
  const [badgeHovered, setBadgeHovered] = useState(false)
  const { addToWishlist, isLoading: addLoading } = useAddToWishlist(id)
  const { removeFromWishlist, isLoading: removeLoading } = useRemoveFromWishlist(id)
  const wishLoading = addLoading || removeLoading

  const year = released?.slice(0, 4)
  const isUpcoming = released ? released > new Date().toISOString().slice(0, 10) : false

  const sorted = [...(platforms ?? [])].sort(
    (a, b) => (PLATFORM_PRIORITY[a] ?? 99) - (PLATFORM_PRIORITY[b] ?? 99)
  )
  const shown = sorted.slice(0, MAX_PLATFORMS)
  const overflow = sorted.length - shown.length

  const coverBg: React.CSSProperties = imageUrl
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(160deg, var(--mantine-color-dark-5) 0%, var(--mantine-color-dark-7) 120%)' }

  const platformPill = {
    fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5,
    background: 'var(--mantine-color-dark-5)',
    color: 'var(--mantine-color-dark-1)',
    flexShrink: 0,
  }

  const handleWishClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onWishToggle) {
      onWishToggle(e)
    } else {
      addToWishlist({ game_id: id, name, released: released ?? null, metacritic: metacritic ?? null, background_image: imageUrl })
    }
  }

  return (
    <Link to='/games/$id' params={{ id: String(id) }} style={{ textDecoration: "none", display: "block" }}>
      <Box
        bg='dark.6'
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setBadgeHovered(false) }}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: hovered
            ? "0 12px 32px -8px rgba(0,0,0,.6)"
            : "inset 0 0 0 1px rgba(255,255,255,0.07)",
          transform: hovered ? "translateY(-3px)" : "none",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
        }}>
        <AspectRatio ratio={3 / 4}>
          <Box style={{ ...coverBg, position: "relative", overflow: "hidden" }}>
            {/* Scanline texture */}
            <Box style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px)" }} />
            {/* Hover gradients — top + bottom */}
            <Box style={{ position: "absolute", top: 0, left: 0, right: 0, height: "46%", background: "linear-gradient(to bottom, rgba(10,15,31,.62), transparent)", opacity: hovered ? 1 : 0, transition: "opacity 0.18s" }} />
            <Box style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: "linear-gradient(to top, rgba(10,15,31,.55), transparent)", opacity: hovered ? 1 : 0, transition: "opacity 0.18s" }} />
            {/* Vignette — dark edges on hover */}
            <Box style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)", opacity: hovered ? 1 : 0, transition: "opacity 0.22s" }} />

            {isUpcoming ? (
              <Box pos='absolute' top={10} left={10}>
                <Box style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "color-mix(in oklab, #7CC8E3 16%, rgba(10,15,31,.6))",
                  backdropFilter: "blur(6px)", color: "#7CC8E3",
                  borderRadius: 999, padding: "5px 11px", fontSize: 12, fontWeight: 500,
                }}>
                  <ClockIcon size={12} /> {year}
                </Box>
              </Box>
            ) : (
              showWish && !inWishlist && (
                <Box
                  pos="absolute"
                  bottom={10}
                  right={10}
                  onClick={handleWishClick}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "color-mix(in oklab, var(--mantine-color-violet-5) 22%, rgba(10,15,31,.72))",
                    backdropFilter: "blur(6px)",
                    color: "var(--mantine-color-violet-3)",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    border: "1px solid color-mix(in oklab, var(--mantine-color-violet-4) 35%, transparent)",
                    boxShadow: "0 0 14px color-mix(in oklab, var(--mantine-color-violet-5) 30%, transparent)",
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? "translateY(0)" : "translateY(4px)",
                    transition: "opacity 0.15s, transform 0.15s",
                    cursor: "pointer",
                    pointerEvents: wishLoading ? "none" : "auto",
                  }}
                >
                  <HeartIcon size={10} fill={false} stroke={2} />
                  Wishlist
                </Box>
              )
            )}

            {inWishlist && (
              <Box
                pos="absolute"
                bottom={10}
                right={10}
                onMouseEnter={() => setBadgeHovered(true)}
                onMouseLeave={() => setBadgeHovered(false)}
                onClick={(e) => { e.preventDefault(); removeFromWishlist() }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: badgeHovered
                    ? "color-mix(in oklab, var(--mantine-color-red-7) 22%, rgba(10,15,31,.72))"
                    : "color-mix(in oklab, var(--mantine-color-violet-5) 22%, rgba(10,15,31,.72))",
                  backdropFilter: "blur(6px)",
                  color: badgeHovered ? "var(--mantine-color-red-4)" : "var(--mantine-color-violet-3)",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  border: badgeHovered
                    ? "1px solid color-mix(in oklab, var(--mantine-color-red-5) 35%, transparent)"
                    : "1px solid color-mix(in oklab, var(--mantine-color-violet-4) 35%, transparent)",
                  boxShadow: badgeHovered
                    ? "0 0 14px color-mix(in oklab, var(--mantine-color-red-6) 25%, transparent)"
                    : "0 0 14px color-mix(in oklab, var(--mantine-color-violet-5) 30%, transparent)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {badgeHovered ? <XIcon size={10} /> : <HeartIcon size={10} fill stroke={0} />}
                {badgeHovered ? "Remove" : "Wishlisted"}
              </Box>
            )}

            {!isUpcoming && (
              <Box pos='absolute' top={10} right={10}>
                <MetacriticBadge score={metacritic ?? null} size={26} />
              </Box>
            )}
          </Box>
        </AspectRatio>

        <Box px={12} py={10}>
          <Text fz={10} tt='uppercase' c='dark.3' fw={700} style={{ letterSpacing: 1.4 }} lineClamp={1}>
            {genres?.[0] ?? "-"}
          </Text>
          <Text fw={700} fz={13} c='dark.0' mt={2} lineClamp={1} style={{ lineHeight: 1.2, letterSpacing: -0.2 }}>
            {name}
          </Text>
          <Group justify='space-between' mt={8} align='center' gap={4} wrap='nowrap'>
            <Group gap={4} wrap='nowrap'>
              {shown.map((slug) => (
                <Box key={slug} style={platformPill}>
                  {PLATFORM[slug] ?? slug.slice(0, 3).toUpperCase()}
                </Box>
              ))}
              {overflow > 0 && <Box style={{ ...platformPill, color: "var(--mantine-color-dark-2)" }}>+{overflow}</Box>}
              {!shown.length && year && <Text fz={11} c='dark.3' ff='monospace'>{year}</Text>}
            </Group>
            {!isUpcoming && (
              <Group gap={3} wrap='nowrap' style={{ flexShrink: 0 }}>
                <StarIcon size={11} fill={displayScore != null} style={{ color: displayScore != null ? "#F0C36B" : "var(--mantine-color-dark-4)" }} />
                <Text fz={11} fw={600} ff='monospace' c={displayScore != null ? "dark.1" : "dark.4"}>
                  {displayScore != null ? displayScore.toFixed(1) : "—"}
                </Text>
              </Group>
            )}
          </Group>
        </Box>
      </Box>
    </Link>
  )
}

import { Link } from '@tanstack/react-router'
import { Box, AspectRatio, UnstyledButton, Group, Text } from '@mantine/core'
import MetacriticBadge from '../../shared/metacritic_badge'
import { HeartIcon, ClockIcon, StarIcon } from '../../shared/icons'

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

const MAX_PLATFORMS = 3

type Props = {
  id: number
  name: string
  imageUrl: string | null
  metacritic?: number | null
  released?: string | null
  genres?: string[]
  platforms?: string[]
  rating?: number | null
  showWish?: boolean
  inWishlist?: boolean
  onWishToggle?: (e: React.MouseEvent) => void
}

export default function GameCard({
  id, name, imageUrl, metacritic, released, genres, platforms, rating,
  showWish = true, inWishlist = false, onWishToggle,
}: Props) {
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

  return (
    <Link to='/games/$id' params={{ id: String(id) }} style={{ textDecoration: "none", display: "block" }}>
      <Box
        bg='dark.6'
        style={{
          borderRadius: "var(--mantine-radius-md)",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
        }}>
        <AspectRatio ratio={3 / 4}>
          <Box style={{ ...coverBg, position: "relative", overflow: "hidden" }}>
            <Box
              style={{
                position: "absolute",
                inset: 0,
                background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px)",
              }}
            />
            <Box
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "35%",
                background: "linear-gradient(to top, rgba(10,15,31,.5), transparent)",
              }}
            />

            {isUpcoming ? (
              <Box pos='absolute' top={10} left={10}>
                <Box
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "color-mix(in oklab, #7CC8E3 16%, rgba(10,15,31,.6))",
                    backdropFilter: "blur(6px)",
                    color: "#7CC8E3",
                    borderRadius: 999,
                    padding: "5px 11px",
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                  <ClockIcon size={12} /> {year}
                </Box>
              </Box>
            ) : (
              showWish && (
                <UnstyledButton
                  pos='absolute'
                  top={10}
                  left={10}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: inWishlist ? "color-mix(in oklab, #F498C8 24%, rgba(10,15,31,.6))" : "rgba(10,15,31,.55)",
                    backdropFilter: "blur(6px)",
                    display: "grid",
                    placeItems: "center",
                    color: inWishlist ? "#F498C8" : "var(--mantine-color-dark-1)",
                    opacity: inWishlist ? 1 : 0,
                    transition: "opacity 0.15s",
                  }}
                  onClick={onWishToggle}>
                  <HeartIcon size={16} fill={inWishlist} />
                </UnstyledButton>
              )
            )}

            {!isUpcoming && (
              <Box pos='absolute' top={10} right={10}>
                <MetacriticBadge score={metacritic ?? null} size={26} />
              </Box>
            )}
          </Box>
        </AspectRatio>

        <Box px={12} py={10}>
          {genres && genres.length > 0 ? (
            <Text fz={10} tt='uppercase' c='dark.3' fw={700} style={{ letterSpacing: 1.4 }} lineClamp={1}>
              {genres[0]}
            </Text>
          ) : (
            <Text fz={10} tt='uppercase' c='dark.3' fw={700} style={{ letterSpacing: 1.4 }} lineClamp={1}>
              -
            </Text>
          )}
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
              {!shown.length && year && (
                <Text fz={11} c='dark.3' ff='monospace'>
                  {year}
                </Text>
              )}
            </Group>
            {rating != null && rating > 0 && (
              <Group gap={3} wrap='nowrap' style={{ flexShrink: 0 }}>
                <StarIcon size={11} fill style={{ color: "#F0C36B" }} />
                <Text fz={11} fw={600} ff='monospace' c='dark.1'>
                  {(rating * 2).toFixed(1)}
                </Text>
              </Group>
            )}
          </Group>
        </Box>
      </Box>
    </Link>
  )
}

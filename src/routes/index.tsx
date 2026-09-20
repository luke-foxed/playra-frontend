import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Anchor, Box, Container, Group, ScrollArea, SimpleGrid, Stack, Text } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import routeProtector from '../lib/route_protector'
import { gamesQueryOptions, popularGamesQueryOptions, recentGamesQueryOptions } from '../features/games/api/games'
import GameCard from '../features/games/components/game_card'
import FeaturedHero from '../features/games/components/featured_hero'
import MetacriticBadge from '../features/shared/metacritic_badge'
import type { Game } from '../features/games/api/schemas'
import { toGameCardProps } from '../features/games/utils/game_card_props'
import { useUserLibrary } from '../features/games/hooks/useUserLibrary'
import { FireIcon, SparkleIcon, StarIcon, ChevronIcon, GamepadIcon } from '../features/shared/icons'
import SectionHeading from '../features/shared/section_heading'

const TOP = { page: 1, page_size: 8, ordering: '-metacritic' as const }

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(popularGamesQueryOptions(10)),
      queryClient.ensureQueryData(recentGamesQueryOptions(8)),
      queryClient.ensureQueryData(gamesQueryOptions(TOP)),
    ])
  },
})

function BrowseAll({ onClick }: { onClick: () => void }) {
  return (
    <Anchor component="button" c="dark.2" fz="sm" onClick={onClick}>
      <Group gap={5} component="span">Browse all <ChevronIcon size={14} /></Group>
    </Anchor>
  )
}

function RouteComponent() {
  const navigate = useNavigate()
  const { data: popularData } = useSuspenseQuery(popularGamesQueryOptions(10))
  const { data: recentData } = useSuspenseQuery(recentGamesQueryOptions(8))
  const { data: topData } = useSuspenseQuery(gamesQueryOptions(TOP))
  const { wishlistedIds, userRatings } = useUserLibrary()

  const popular = popularData.results
  const fresh = recentData.results
  const topRated = topData.results.filter((g) => g.metacritic != null).slice(0, 8)
  const featured = fresh[0]

  const browse = <BrowseAll onClick={() => navigate({ to: '/games', search: { page: 1, page_size: 20 } })} />

  return (
    <Container size={1440} px="xl" pb={60}>
      {featured && <FeaturedHero game={featured} />}

      <Box mt={44}>
        <SectionHeading icon={<FireIcon size={20} />} right={browse}>Popular right now</SectionHeading>
        <ScrollArea type="hover" scrollbarSize={4}>
          <Group gap={18} wrap="nowrap" align="stretch" pb={8}>
            {popular.map((g) => (
              <Box key={g.id} w={200} style={{ flexShrink: 0 }}>
                <GameCard {...toGameCardProps(g)} inWishlist={wishlistedIds.has(g.id)} userScore={userRatings.get(g.id) ?? null} />
              </Box>
            ))}
          </Group>
        </ScrollArea>
      </Box>

      <Box mt={44}>
        <SectionHeading icon={<SparkleIcon size={18} />} right={browse}>New releases</SectionHeading>
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, lg: 5 }} spacing="md">
          {fresh.map((g) => (
            <GameCard
              key={g.id}
              {...toGameCardProps(g)}
              inWishlist={wishlistedIds.has(g.id)}
              userScore={userRatings.get(g.id) ?? null}
            />
          ))}
        </SimpleGrid>
      </Box>

      <Box mt={44}>
        <SectionHeading icon={<StarIcon size={17} fill />} right={browse}>Top rated of all time</SectionHeading>
        <Stack gap="xs">
          {topRated.map((g, i) => <TopRatedRow key={g.id} game={g} rank={i + 1} />)}
        </Stack>
      </Box>
    </Container>
  )
}

function TopRatedRow({ game, rank }: { game: Game; rank: number }) {
  const { hovered, ref } = useHover<HTMLAnchorElement>()

  return (
    <Link
      ref={ref}
      to="/games/$id"
      params={{ id: String(game.id) }}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 'var(--mantine-radius-md)',
        background: hovered ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-dark-6)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        transition: 'background 0.14s',
      }}
    >
      <Group gap={16} wrap="nowrap" py={10} pl={10} pr={16}>
        <Text fw={600} fz={18} c="dark.2" ta="center" ff="monospace" w={42} visibleFrom="sm">{String(rank).padStart(2, '0')}</Text>
        <Box
          w={56}
          h={56}
          bdrs={9}
          bg="dark.5"
          c="dark.3"
          display="grid"
          style={{
            flexShrink: 0,
            placeItems: 'center',
            backgroundImage: game.background_image ? `url("${game.background_image}")` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {!game.background_image && <GamepadIcon size={24} />}
        </Box>
        <Box flex={1} miw={0}>
          <Text fw={600} fz={15} truncate style={{ letterSpacing: -0.3 }}>{game.name}</Text>
          <Text fz="xs" c="dark.2" mt={2}>{game.released?.slice(0, 4)}</Text>
        </Box>
        <Group gap={6} visibleFrom="sm" wrap="nowrap">
          {game.genres.slice(0, 2).map((x) => (
            <Box key={x.id} px={11} py={5} bdrs={999} bg="dark.5" c="dark.1" fz={12} fw={500}>{x.name}</Box>
          ))}
        </Group>
        <MetacriticBadge score={game.metacritic} />
      </Group>
    </Link>
  )
}

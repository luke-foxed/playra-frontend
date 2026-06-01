import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Box, Group, Text, Title, SimpleGrid, Button, Stack, Anchor, Container } from '@mantine/core'
import routeProtector from '../lib/route_protector'
import { gamesQueryOptions, popularGamesQueryOptions, recentGamesQueryOptions } from '../features/games/api/games'
import type { Game } from '../features/games/api/schemas'
import GameCard from '../features/games/components/game_card'
import MetacriticBadge from '../features/shared/metacritic_badge'
import { PlayIcon, HeartIcon, FireIcon, SparkleIcon, StarIcon, ChevronIcon, GamepadIcon } from '../features/shared/icons'
import PlayraLoader from '../features/shared/playra_loader'

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
  pendingComponent: () => <PlayraLoader />
})

function SectionHead({ title, icon, onSee }: { title: string; icon: React.ReactNode; onSee?: () => void }) {
  return (
    <Group justify="space-between" mb="md" align="flex-end">
      <Group gap={11}>
        <Box style={{ color: 'var(--mantine-color-violet-4)', display: 'grid' }}>{icon}</Box>
        <Title order={2} style={{ letterSpacing: -0.6 }}>{title}</Title>
      </Group>
      {onSee && (
        <Anchor component="button" c="dark.2" fz="sm" onClick={onSee}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          Browse all <ChevronIcon size={14} />
        </Anchor>
      )}
    </Group>
  )
}

function RouteComponent() {
  const navigate = useNavigate()
  const { data: popularData } = useSuspenseQuery(popularGamesQueryOptions(10))
  const { data: recentData } = useSuspenseQuery(recentGamesQueryOptions(8))
  const { data: topData } = useSuspenseQuery(gamesQueryOptions(TOP))

  const popular = popularData.results
  const fresh = recentData.results
  const topRated = topData.results.filter((g) => g.metacritic != null)
  const featured: Game | undefined = fresh[0]

  const goGames = () => navigate({ to: '/games', search: { page: 1, page_size: 20 } })

  return (
    <Container size={1440} px="xl" pb="xl">
      {/* HERO */}
      {featured && (
        <Box
          mt="xl"
          className="hero-container"
          style={{
            position: 'relative', borderRadius: 'var(--mantine-radius-xl)', overflow: 'hidden',
            minHeight: 380, display: 'flex', alignItems: 'flex-end', cursor: 'pointer',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
          }}
          onClick={() => navigate({ to: '/games/$id', params: { id: String(featured.id) } })}
        >
          <div
            className="hero-bg-img"
            style={
              featured.background_image
                ? { backgroundImage: `url(${featured.background_image})` }
                : { background: 'var(--mantine-color-dark-5)' }
            }
          />
          <Box style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(10,15,31,.94) 12%, rgba(10,15,31,.55) 48%, transparent 80%)' }} />
          <Box style={{ position: 'relative', padding: '44px 48px', maxWidth: 600 }}>
            <Box
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'color-mix(in oklab, #7CC8E3 16%, transparent)', color: '#7CC8E3',
                borderRadius: 999, padding: '5px 11px', fontSize: 12, fontWeight: 500, marginBottom: 14,
              }}
            >
              <SparkleIcon size={13} /> Featured
            </Box>
            <Title order={1} mb="sm" style={{ lineHeight: 1.02, letterSpacing: -1.6, fontSize: 46, textWrap: 'balance' }}>
              {featured.name}
            </Title>
            <Group gap="sm" mb="md" align="center">
              <MetacriticBadge score={featured.metacritic} />
              <Text c="dark.2">·</Text>
              <Text c="dark.2" fz="sm">{featured.genres.map((g) => g.name).join(' · ')}</Text>
            </Group>
            <Group gap="xs">
              <Button
                leftSection={<PlayIcon size={16} />}
                onClick={(e) => { e.stopPropagation(); navigate({ to: '/games/$id', params: { id: String(featured.id) } }) }}
              >
                View game
              </Button>
              <Button variant="outline" color="gray" leftSection={<HeartIcon size={16} />} onClick={(e) => e.stopPropagation()}>
                Wishlist
              </Button>
            </Group>
          </Box>
        </Box>
      )}

      {/* POPULAR NOW */}
      <Box mt={44}>
        <SectionHead title="Popular right now" icon={<FireIcon size={20} />} onSee={goGames} />
        <div className="scroll-rail">
          {popular.map((g) => (
            <Box key={g.id} style={{ width: 200 }}>
              <GameCard id={g.id} name={g.name} imageUrl={g.background_image} metacritic={g.metacritic} released={g.released} genres={g.genres.map((x) => x.name)} platforms={g.platforms.map((x) => x.platform.slug)} communityScore={g.playra_community_score} />
            </Box>
          ))}
        </div>
      </Box>

      {/* NEW RELEASES */}
      <Box mt={44}>
        <SectionHead title="New releases" icon={<SparkleIcon size={18} />} onSee={goGames} />
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 4, lg: 5 }} spacing="md">
          {fresh.map((g) => (
            <GameCard key={g.id} id={g.id} name={g.name} imageUrl={g.background_image} metacritic={g.metacritic} released={g.released} genres={g.genres.map((x) => x.name)} platforms={g.platforms.map((x) => x.platform.slug)} communityScore={g.playra_community_score} />
          ))}
        </SimpleGrid>
      </Box>

      {/* TOP RATED */}
      <Box mt={44}>
        <SectionHead title="Top rated of all time" icon={<StarIcon size={17} fill />} onSee={goGames} />
        <Stack gap="xs">
          {topRated.slice(0, 8).map((g, i) => (
            <Box
              key={g.id}
              style={{
                display: 'grid', gridTemplateColumns: '42px 56px 1fr auto auto', gap: 16,
                alignItems: 'center', padding: '10px 16px 10px 10px',
                background: 'var(--mantine-color-dark-6)', borderRadius: 'var(--mantine-radius-md)',
                cursor: 'pointer', transition: 'background 0.14s',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              }}
              onClick={() => navigate({ to: '/games/$id', params: { id: String(g.id) } })}
            >
              <Text fw={600} fz={18} c="dark.2" ta="center" ff="monospace">
                {String(i + 1).padStart(2, '0')}
              </Text>
              <Box
                style={{
                  width: 56, height: 56, borderRadius: 9,
                  backgroundColor: 'var(--mantine-color-dark-5)',
                  backgroundImage: g.background_image ? `url(${g.background_image})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  color: 'var(--mantine-color-dark-3)',
                }}
              >
                {!g.background_image && <GamepadIcon size={24} />}
              </Box>
              <Box>
                <Text fw={600} fz={15} style={{ letterSpacing: -0.3 }}>{g.name}</Text>
                <Text fz="xs" c="dark.2" mt={2}>{g.released?.slice(0, 4)}</Text>
              </Box>
              <Group gap={6} visibleFrom="sm">
                {g.genres.slice(0, 2).map((x) => (
                  <Box key={x.id} style={{ fontSize: 12, padding: '5px 11px', borderRadius: 999, background: 'var(--mantine-color-dark-5)', color: 'var(--mantine-color-dark-1)', fontWeight: 500 }}>
                    {x.name}
                  </Box>
                ))}
              </Group>
              <MetacriticBadge score={g.metacritic} />
            </Box>
          ))}
        </Stack>
      </Box>

      <Box h={60} />
    </Container>
  )
}

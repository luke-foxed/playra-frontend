import { useState } from 'react'
import { ActionIcon, BackgroundImage, Box, Button, Container, Flex, Group, Select, SimpleGrid, Text, TextInput, Title } from '@mantine/core'
import GameCard from '../../games/components/game_card'
import { PlusIcon, SearchIcon, XIcon } from '../../shared/icons'
import type { ListDetail } from '../api/schemas'
import { LIST_ACCENT } from '../constants'
import { defaultSortFor, filterAndSortGames, sortOptionsFor } from '../utils/sort_games'
import type { SortOrder } from '../utils/sort_games'
import ListTypeIcon from './list_type_icon'

type Props = {
  detail: ListDetail
  back: React.ReactNode
  meta: React.ReactNode
  actions?: React.ReactNode
  notice?: React.ReactNode
  onRemoveGame?: (gameId: number) => void
  onAddGames?: () => void
  children?: React.ReactNode
}

export default function ListDetailView({ detail, back, meta, actions, notice, onRemoveGame, onAddGames, children }: Props) {
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortFor(detail.type))

  const accent = LIST_ACCENT[detail.type]
  const games = filterAndSortGames(detail.games, query, sortOrder)

  return (
    <Box>
      <ListHero detail={detail} />

      <Container size={1440} px="xl" pb={60}>
        {back}

        <Group justify="space-between" align="flex-start" gap="xl" mt="xl" mb="lg" wrap="wrap">
          <Group gap="md" align="center">
            <Box
              w={56}
              h={56}
              bdrs="md"
              display="grid"
              c={accent ?? 'violet.4'}
              bg={`color-mix(in oklab, ${accent ?? 'var(--mantine-color-violet-5)'} 18%, transparent)`}
              style={{ placeItems: 'center' }}
            >
              <ListTypeIcon type={detail.type} />
            </Box>
            <Box>
              <Title order={1} fz={30} style={{ letterSpacing: -0.9 }}>{detail.name}</Title>
              <Group gap="xs" mt={4}>{meta}</Group>
            </Box>
          </Group>
          {actions}
        </Group>

        {notice}

        {detail.games.length > 0 && (
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            justify={{ sm: 'space-between' }}
            align={{ base: 'stretch', sm: 'center' }}
            gap={8}
            mb={16}
          >
            <TextInput
              placeholder="Search games…"
              leftSection={<SearchIcon size={15} />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              w={{ base: 'auto', sm: 320 }}
            />
            <Select
              value={sortOrder}
              onChange={(v) => setSortOrder(v as SortOrder)}
              data={sortOptionsFor(detail.type)}
              w={{ base: 'auto', sm: 210 }}
              allowDeselect={false}
            />
          </Flex>
        )}

        {detail.games.length === 0 ? (
          <Box ta="center" py={64}>
            <Text fw={600} c="dark.1" mb={6}>This list is empty</Text>
            {onAddGames && (
              <>
                <Text c="dark.2" fz="sm">Add some games to get started.</Text>
                <Button size="sm" mt="md" leftSection={<PlusIcon size={15} />} onClick={onAddGames}>Add games</Button>
              </>
            )}
          </Box>
        ) : games.length === 0 ? (
          <Box ta="center" py={64}>
            <Text fw={600} c="dark.1">No results for "{query}"</Text>
          </Box>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md" mt="md">
            {games.map((g) => (
              <Box key={g.game_id} pos="relative">
                <GameCard
                  id={g.game_id}
                  name={g.name}
                  imageUrl={g.background_image}
                  metacritic={g.metacritic}
                  released={g.released}
                  genres={g.genres.map((x) => x.name)}
                  communityScore={g.user_rating ?? undefined}
                  showWish={false}
                />
                {onRemoveGame && (
                  <ActionIcon
                    variant="filled"
                    color="dark"
                    size="sm"
                    radius="xl"
                    aria-label={`Remove ${g.name}`}
                    onClick={() => onRemoveGame(g.game_id)}
                    pos="absolute"
                    top={8}
                    left={8}
                    style={{ zIndex: 10, background: 'rgba(10,15,31,.7)', backdropFilter: 'blur(6px)' }}
                  >
                    <XIcon size={14} />
                  </ActionIcon>
                )}
              </Box>
            ))}
          </SimpleGrid>
        )}

        {children}
      </Container>
    </Box>
  )
}

function ListHero({ detail }: { detail: ListDetail }) {
  const accent = LIST_ACCENT[detail.type]
  const collage = accent && !detail.cover_url
    ? detail.games.filter((g) => g.background_image).slice(0, 5)
    : []

  return (
    <Box pos="relative" h={{ base: 220, sm: 340 }}>
      {detail.cover_url ? (
        <BackgroundImage src={detail.cover_url} pos="absolute" inset={0}>
          <Box pos="absolute" inset={0} bg="linear-gradient(to bottom, rgba(10,15,31,.3) 0%, rgba(10,15,31,.75) 60%, var(--mantine-color-dark-7) 100%)" />
        </BackgroundImage>
      ) : collage.length >= 2 ? (
        <>
          <Flex pos="absolute" inset={0} style={{ overflow: 'hidden' }}>
            {collage.map((g) => (
              <Box
                key={g.game_id}
                flex={1}
                style={{
                  backgroundImage: `url("${g.background_image}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.6) saturate(1.1)',
                }}
              />
            ))}
          </Flex>
          <Box pos="absolute" inset={0} bg="repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.07) 3px 4px)" />
          <Box pos="absolute" inset={0} bg="linear-gradient(to bottom, rgba(10,15,31,0) 0%, rgba(10,15,31,.5) 35%, rgba(10,15,31,.88) 62%, rgba(10,15,31,1) 78%)" />
        </>
      ) : accent ? (
        <>
          <Box
            pos="absolute"
            inset={0}
            bg={`linear-gradient(120deg, color-mix(in oklab, ${accent} 26%, transparent) 0%, transparent 58%), linear-gradient(160deg, var(--mantine-color-dark-6) 10%, var(--mantine-color-dark-8) 130%)`}
          />
          <Box
            pos="absolute"
            inset={0}
            opacity={0.45}
            style={{
              backgroundImage: `radial-gradient(color-mix(in oklab, ${accent} 30%, transparent) 1px, transparent 1.4px)`,
              backgroundSize: '22px 22px',
              WebkitMaskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)',
              maskImage: 'linear-gradient(115deg, #000 0%, transparent 52%)',
            }}
          />
        </>
      ) : (
        <Box
          pos="absolute"
          inset={0}
          bg="linear-gradient(135deg, color-mix(in oklab, var(--mantine-color-violet-8) 35%, var(--mantine-color-dark-7)) 0%, var(--mantine-color-dark-7) 100%)"
        />
      )}
    </Box>
  )
}

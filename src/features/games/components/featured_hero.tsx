import { Link, useNavigate } from '@tanstack/react-router'
import { useHover } from '@mantine/hooks'
import { Badge, Box, Button, Group, Text, Title } from '@mantine/core'
import dayjs from 'dayjs'
import MetacriticBadge from '../../shared/metacritic_badge'
import { HeartIcon, PlayIcon, SparkleIcon } from '../../shared/icons'
import useWishlist from '../../lists/hooks/useWishlist'
import { useUserLibrary } from '../hooks/useUserLibrary'
import type { Game } from '../api/schemas'

// polymorphic `component` can't infer TanStack Link props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkCast = Link as any

function WishlistButton({ game }: { game: Game }) {
  const { toggleWishlist, isLoading } = useWishlist(game.id)
  const { wishlistedIds } = useUserLibrary()
  const inWishlist = wishlistedIds.has(game.id)
  const gamePayload = {
    game_id: game.id, name: game.name,
    release_year: game.first_release_date != null ? dayjs.unix(game.first_release_date).year() : null,
    genres: game.genres, critic_rating: game.aggregated_rating, cover_url: game.cover_url,
  }

  return (
    <Button
      variant="outline"
      color="gray"
      loading={isLoading}
      leftSection={<HeartIcon size={16} fill={inWishlist} />}
      onClick={(e) => {
        e.stopPropagation()
        toggleWishlist({ inWishlist, gamePayload }).catch(() => {})
      }}
    >
      {inWishlist ? 'Wishlisted' : 'Wishlist'}
    </Button>
  )
}

export default function FeaturedHero({ game }: { game: Game }) {
  const navigate = useNavigate()
  const { hovered, ref } = useHover<HTMLDivElement>()

  return (
    <Box
      ref={ref}
      mt="xl"
      mih={{ base: 240, sm: 380 }}
      pos="relative"
      display="flex"
      bdrs="xl"
      style={{ alignItems: 'flex-end', overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)', transform: 'translateZ(0)' }}
      onClick={() => navigate({ to: '/games/$id', params: { id: String(game.id) } })}
    >
      <Box
        pos="absolute"
        inset={0}
        bg={game.cover_url ? undefined : 'dark.5'}
        style={{
          backgroundImage: game.cover_url ? `url("${game.cover_url}")` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: hovered ? 'scale(1.03)' : 'none',
          transition: 'transform 0.4s ease',
        }}
      />
      <Box pos="absolute" inset={0} bg="linear-gradient(105deg, rgba(10,15,31,.94) 12%, rgba(10,15,31,.55) 48%, transparent 80%)" />
      <Box pos="relative" maw={600} p={{ base: 'xl', sm: '44px 48px' }}>
        <Badge mb={14} size="lg" variant="light" color="cyan" leftSection={<SparkleIcon size={13} />} tt="none" fw={500}>
          Featured
        </Badge>
        <Title order={1} mb="sm" fz={{ base: 28, sm: 46 }} lh={1.02} style={{ letterSpacing: -1.6, textWrap: 'balance' }}>
          {game.name}
        </Title>
        <Group gap="sm" mb="md" align="center">
          <MetacriticBadge score={game.aggregated_rating} />
          <Text c="dark.2">·</Text>
          <Text c="dark.2" fz="sm">{game.genres.map((g) => g.name).join(' · ')}</Text>
        </Group>
        <Group gap="xs">
          <Button
            component={LinkCast}
            to="/games/$id"
            params={{ id: String(game.id) }}
            leftSection={<PlayIcon size={16} />}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            View game
          </Button>
          <WishlistButton game={game} />
        </Group>
      </Box>
    </Box>
  )
}

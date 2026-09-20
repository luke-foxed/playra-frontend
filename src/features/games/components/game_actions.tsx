import { Anchor, Badge, Button, Group, Stack, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { HeartIcon, ListIcon, PlusIcon } from '../../shared/icons'
import StarRating from '../../shared/star_rating'
import useRateGame from '../../lists/hooks/useRateGame'
import useWishlist from '../../lists/hooks/useWishlist'
import type { List, ListGame } from '../../lists/api/schemas'

type Props = {
  gameId: number
  gamePayload: ListGame
  ratingsList: List | undefined
  inWishlist: boolean
  rating: number
  inLists: Array<{ id: string; name: string }>
  onAddToList: () => void
}

export default function GameActions({ gameId, gamePayload, ratingsList, inWishlist, rating, inLists, onAddToList }: Props) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const { toggleWishlist, isLoading: wishlistLoading } = useWishlist(gameId)
  const { rateGame, isLoading: ratingLoading } = useRateGame(gameId, ratingsList)

  return (
    <>
      <Group gap="xs" wrap="wrap">
        <Button
          color="violet"
          variant={inWishlist ? 'light' : 'filled'}
          leftSection={<HeartIcon size={17} fill={inWishlist} />}
          loading={wishlistLoading}
          fullWidth={isMobile}
          onClick={() => toggleWishlist({ inWishlist, gamePayload }).catch(() => {})}
        >
          {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </Button>
        <Button
          variant="outline"
          color="gray"
          leftSection={<PlusIcon size={17} />}
          fullWidth={isMobile}
          rightSection={inLists.length > 0 ? <Badge size="xs" color="violet" variant="filled">{inLists.length}</Badge> : undefined}
          onClick={onAddToList}
        >
          Add to list
        </Button>
      </Group>

      <Stack
        p="lg"
        bg="dark.6"
        bdrs="md"
        gap={10}
        w={{ base: '100%', sm: 'auto' }}
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
      >
        <Text fz="xs" tt="uppercase" c="dark.2" fw={600} style={{ letterSpacing: 1.4 }}>
          {rating ? 'Your rating' : 'Rate this game'}
        </Text>
        <Group gap="md" align="center">
          <StarRating
            value={rating}
            readonly={ratingLoading}
            onChange={(n) => rateGame({ score: n, gamePayload }).catch(() => {})}
            size={isMobile ? 20 : 24}
          />
          {rating > 0 && (
            <>
              <Text ff="monospace" fw={700} fz="sm" c="dark.1">{rating}/10</Text>
              <Anchor component="button" c="violet" fz="sm" onClick={() => rateGame({ score: 0, gamePayload }).catch(() => {})}>
                Clear
              </Anchor>
            </>
          )}
        </Group>
      </Stack>

      {inLists.length > 0 && (
        <Group gap="xs" wrap="wrap">
          <Text fz="sm" c="dark.2">On your lists:</Text>
          {inLists.map((l) => (
            <Badge key={l.id} variant="light" color="cyan" leftSection={<ListIcon size={12} />} radius="xl">
              {l.name}
            </Badge>
          ))}
        </Group>
      )}
    </>
  )
}

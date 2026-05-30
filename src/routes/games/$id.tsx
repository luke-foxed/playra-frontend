import { createFileRoute } from "@tanstack/react-router"
import {
  Badge,
  Box,
  Group,
  Image,
  Loader,
  Rating,
  Stack,
  Text,
  Title,
  Button,
} from "@mantine/core"
import { useSuspenseQuery } from "@tanstack/react-query"
import { gameQueryOptions, userGameQueryOptions } from "../../features/games/api/games"
import routeProtector from "../../lib/route_protector"
import { listsQueryOptions } from "../../features/lists/api/lists"
import useWishlistToggle from "../../features/lists/hooks/useWishlistToggle"
import useRateGame from "../../features/lists/hooks/useRateGame"

export const Route = createFileRoute("/games/$id")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: async ({ context: { queryClient }, params }) => {
    const id = Number(params.id)
    await Promise.all([
      queryClient.ensureQueryData(gameQueryOptions(id)),
      queryClient.ensureQueryData(userGameQueryOptions(id)),
      queryClient.ensureQueryData(listsQueryOptions()),
    ])
  },
  pendingComponent: () => <Loader />,
})

function RouteComponent() {
  const params = Route.useParams()
  const id = Number(params.id)

  const { data: game } = useSuspenseQuery(gameQueryOptions(id))
  const { data: userGame } = useSuspenseQuery(userGameQueryOptions(id))
  const { data: myLists } = useSuspenseQuery(listsQueryOptions())

  const wishlist = myLists.find((l) => l.type === "wishlist")
  const playlist = myLists.find((l) => l.type === "playlist")

  const inWishlist = userGame.in_wishlist
  const currentScore = userGame.rating ?? 0

  const gamePayload = {
    game_id: game.id,
    name: game.name,
    released: game.released,
    genres: game.genres,
    metacritic: game.metacritic,
    background_image: game.background_image,
  }

  const { toggleWishlist, isLoading: wishlistLoading } = useWishlistToggle(id, wishlist)
  const { rateGame, isLoading: ratingLoading } = useRateGame(id, playlist)

  return (
    <Box>
      {game.background_image && (
        <Image src={game.background_image} alt={game.name} h={400} fit="cover" mb="md" />
      )}

      <Stack gap="md" p="md">
        <Group justify="space-between" align="flex-start">
          <Title>{game.name}</Title>
          <Group gap="xs">
            {game.metacritic && (
              <Badge color="green" size="lg">Metacritic {game.metacritic}</Badge>
            )}
            <Badge color="yellow" size="lg">⭐ {game.rating.toFixed(1)}</Badge>
          </Group>
        </Group>

        <Group gap="xs">
          <Text size="sm" c="dimmed">Released: {game.released}</Text>
          <Text size="sm" c="dimmed">·</Text>
          <Text size="sm" c="dimmed">Playtime: ~{game.playtime}h</Text>
          {game.esrb_rating && (
            <>
              <Text size="sm" c="dimmed">·</Text>
              <Text size="sm" c="dimmed">ESRB: {game.esrb_rating.name}</Text>
            </>
          )}
        </Group>

        <Group gap="xs">
          {game.genres.map((g) => (
            <Badge key={g.id} variant="light">{g.name}</Badge>
          ))}
        </Group>

        <Group gap="md" align="center">
          <Button
            variant={inWishlist ? "filled" : "outline"}
            color="blue"
            loading={wishlistLoading}
            onClick={() => toggleWishlist({ inWishlist, gamePayload })}
          >
            {inWishlist ? "✓ Wishlist" : "+ Wishlist"}
          </Button>
          <Group gap="xs" align="center">
            <Text size="sm" c="dimmed">Your score:</Text>
            <Rating
              size="md"
              count={10}
              value={currentScore}
              onChange={(score) => rateGame({ score, gamePayload })}
              readOnly={ratingLoading}
            />
            {ratingLoading && <Loader size="xs" />}
          </Group>
        </Group>

        <Text>{game.description_raw}</Text>

        <Stack gap="xs">
          <Text fw={600}>Platforms</Text>
          <Group gap="xs">
            {game.platforms.map((p) => (
              <Badge key={p.platform.id} variant="outline">{p.platform.name}</Badge>
            ))}
          </Group>
        </Stack>

        <Group gap="xl">
          <Stack gap="xs">
            <Text fw={600}>Developers</Text>
            {game.developers.map((d) => (
              <Text key={d.id} size="sm">{d.name}</Text>
            ))}
          </Stack>
          <Stack gap="xs">
            <Text fw={600}>Publishers</Text>
            {game.publishers.map((p) => (
              <Text key={p.id} size="sm">{p.name}</Text>
            ))}
          </Stack>
        </Group>

        <Stack gap="xs">
          <Text fw={600}>Tags</Text>
          <Group gap="xs">
            {game.tags.map((t) => (
              <Badge key={t.id} variant="dot" size="sm">{t.name}</Badge>
            ))}
          </Group>
        </Stack>

        {game.website && (
          <Text size="sm">
            <a href={game.website} target="_blank" rel="noreferrer">
              {game.website}
            </a>
          </Text>
        )}
      </Stack>
    </Box>
  )
}

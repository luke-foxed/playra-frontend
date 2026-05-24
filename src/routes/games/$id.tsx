import { createFileRoute } from "@tanstack/react-router"
import { Badge, Box, Group, Loader, Stack, Title, Text, Image } from "@mantine/core"
import { getGame } from "../../features/games/api/games"
import routeProtector from "../../lib/route_protector"

export const Route = createFileRoute("/games/$id")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: ({ params }) => getGame(Number(params.id)),
  pendingComponent: () => <Loader />,
})

function RouteComponent() {
  const game = Route.useLoaderData()
  return (
    <Box>
      {game.background_image && <Image src={game.background_image} alt={game.name} h={400} fit='cover' mb='md' />}

      <Stack gap='md' p='md'>
        <Group justify='space-between' align='flex-start'>
          <Title>{game.name}</Title>
          <Group gap='xs'>
            {game.metacritic && (
              <Badge color='green' size='lg'>
                Metacritic {game.metacritic}
              </Badge>
            )}
            <Badge color='yellow' size='lg'>
              ⭐ {game.rating.toFixed(1)}
            </Badge>
          </Group>
        </Group>

        <Group gap='xs'>
          <Text size='sm' c='dimmed'>
            Released: {game.released}
          </Text>
          <Text size='sm' c='dimmed'>
            ·
          </Text>
          <Text size='sm' c='dimmed'>
            Playtime: ~{game.playtime}h
          </Text>
          {game.esrb_rating && (
            <>
              <Text size='sm' c='dimmed'>
                ·
              </Text>
              <Text size='sm' c='dimmed'>
                ESRB: {game.esrb_rating.name}
              </Text>
            </>
          )}
        </Group>

        <Group gap='xs'>
          {game.genres.map((g) => (
            <Badge key={g.id} variant='light'>
              {g.name}
            </Badge>
          ))}
        </Group>

        <Text>{game.description_raw}</Text>

        <Stack gap='xs'>
          <Text fw={600}>Platforms</Text>
          <Group gap='xs'>
            {game.platforms.map((p) => (
              <Badge key={p.platform.id} variant='outline'>
                {p.platform.name}
              </Badge>
            ))}
          </Group>
        </Stack>

        <Group gap='xl'>
          <Stack gap='xs'>
            <Text fw={600}>Developers</Text>
            {game.developers.map((d) => (
              <Text key={d.id} size='sm'>
                {d.name}
              </Text>
            ))}
          </Stack>
          <Stack gap='xs'>
            <Text fw={600}>Publishers</Text>
            {game.publishers.map((p) => (
              <Text key={p.id} size='sm'>
                {p.name}
              </Text>
            ))}
          </Stack>
        </Group>

        <Stack gap='xs'>
          <Text fw={600}>Tags</Text>
          <Group gap='xs'>
            {game.tags.map((t) => (
              <Badge key={t.id} variant='dot' size='sm'>
                {t.name}
              </Badge>
            ))}
          </Group>
        </Stack>

        {game.website && (
          <Text size='sm'>
            <a href={game.website} target='_blank' rel='noreferrer'>
              {game.website}
            </a>
          </Text>
        )}
      </Stack>
    </Box>
  )
}

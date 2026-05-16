import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Box, Grid, Group, Pagination, Select } from "@mantine/core"
import GameCard from "../../features/games/components/game_card"
import { getGames } from "../../features/games/api/games"
import { GamesSearchSchema } from "../../features/games/api/schemas"

export const Route = createFileRoute("/games/")({
  component: RouteComponent,
  validateSearch: GamesSearchSchema.parse,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getGames(deps),
  pendingComponent: () => <div>Loading...</div>,
  staleTime: Infinity,
})

function RouteComponent() {
  const games = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: "/games/" })

  return (
    <Box>
      <Grid>
        {games.results.map((game) => (
          <Grid.Col key={game.id} span={{ base: 12, xs: 6, sm: 4, md: 3, lg: 2 }}>
            <GameCard name={game.name} imageUrl={game.background_image} id={game.id} />
          </Grid.Col>
        ))}
      </Grid>

      <Group justify="center">
        <Select
          label="Items per page"
          data={["10", "20", "50", "100"]}
          defaultValue={String(search.page_size ?? 20)}
          onChange={(value) => navigate({ search: (prev) => ({ ...prev, page_size: Number(value), page: 1 }) })}
        />
      </Group>
      <Pagination
        total={Math.ceil((games.count ?? 0) / (search.page_size ?? 20))}
        value={search.page ?? 1}
        onChange={(page) => navigate({ search: (prev) => ({ ...prev, page }) })}
      />
    </Box>
  )
}

import { createFileRoute } from "@tanstack/react-router"
import useGetGames from "../../hooks/useGetGames"

export const Route = createFileRoute("/games/")({
  component: RouteComponent,
})

const defaultParams = {
  page: 1,
  page_size: 10,
}

function RouteComponent() {
  const { data, isLoading } = useGetGames(defaultParams)

  return <div>{isLoading ? "Loading..." : data?.results.map((game) => <div key={game.id}>{game.name}</div>)}</div>
}

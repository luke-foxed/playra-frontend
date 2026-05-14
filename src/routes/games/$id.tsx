import { createFileRoute } from "@tanstack/react-router"
import useGetGames from "../../hooks/useGetGame"

export const Route = createFileRoute("/games/$id")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data, isLoading } = useGetGames(Number(id))

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <div>{JSON.stringify(data)}</div>
}

import { createFileRoute, Outlet } from "@tanstack/react-router"
import routeProtector from "../../lib/route_protector"
import PlayraLoader from "../../features/shared/playra_loader"

export const Route = createFileRoute("/profile/$id")({
  beforeLoad: routeProtector,
  pendingComponent: () => <PlayraLoader />,
  component: () => <Outlet />,
})

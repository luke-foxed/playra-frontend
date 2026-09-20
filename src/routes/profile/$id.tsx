import { createFileRoute, Outlet } from "@tanstack/react-router"
import routeProtector from "../../lib/route_protector"

export const Route = createFileRoute("/profile/$id")({
  beforeLoad: routeProtector,
  component: () => <Outlet />,
})

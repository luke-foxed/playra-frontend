import { createFileRoute } from '@tanstack/react-router'
import routeProtector from '../lib/route_protector'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: routeProtector,
})

function RouteComponent() {
  return <div>Hello "/"!</div>
}

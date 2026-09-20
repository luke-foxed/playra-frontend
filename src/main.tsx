import ReactDOM from "react-dom/client"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"
import PlayraLoader from "./features/shared/playra_loader"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000 },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPendingComponent: PlayraLoader,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />)

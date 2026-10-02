import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { Shell } from '../components/shell/Shell'

export const renderShell = async (path = '/') => {
  const root = createRootRoute({ component: Shell })
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <h1>home page</h1>,
  })
  const system = createRoute({
    getParentRoute: () => root,
    path: '/system',
    component: () => <h1>system page</h1>,
  })
  const login = createRoute({
    getParentRoute: () => root,
    path: '/login',
    component: () => <h1>login page</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([home, system, login]),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  const view = render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await router.load()
  return { ...view, router }
}

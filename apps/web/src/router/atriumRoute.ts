import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateSystemSearch } from '../validators/validateSystemSearch'
import { shellRoute } from './shellRoute'

// Lazy, like the Worker route: chart code stays off the initial route.
export const atriumRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/atrium',
  validateSearch: validateSystemSearch,
  component: lazyRouteComponent(
    async () => import('../screens/atrium/AtriumScreen'),
    'AtriumScreen',
  ),
})

import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validatePendingSearch } from '../validators/validatePendingSearch'
import { shellRoute } from './shellRoute'

export const pendingRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/pending',
  validateSearch: validatePendingSearch,
  component: lazyRouteComponent(
    async () => import('../screens/pending/PendingScreen'),
    'PendingScreen',
  ),
})

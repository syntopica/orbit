import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { shellRoute } from './shellRoute'

export const workerJobRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/worker/jobs/$id',
  component: lazyRouteComponent(
    async () => import('../screens/worker/WorkerJobScreen'),
    'WorkerJobScreen',
  ),
})

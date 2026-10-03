import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateWorkerSearch } from '../validators/validateWorkerSearch'
import { shellRoute } from './shellRoute'

// Lazy: the chart code lands in its own chunk, off the initial route.
export const workerRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/worker',
  validateSearch: validateWorkerSearch,
  component: lazyRouteComponent(
    async () => import('../screens/worker/WorkerScreen'),
    'WorkerScreen',
  ),
})

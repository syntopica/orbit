import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateWorkerJobsSearch } from '../validators/validateWorkerJobsSearch'
import { shellRoute } from './shellRoute'

export const workerJobsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/worker/jobs',
  validateSearch: validateWorkerJobsSearch,
  component: lazyRouteComponent(
    async () => import('../screens/worker/WorkerJobsScreen'),
    'WorkerJobsScreen',
  ),
})

import { createRoute } from '@tanstack/react-router'

import { WorkerScreen } from '../screens/worker/WorkerScreen'
import { shellRoute } from './shellRoute'

export const workerRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/worker',
  component: WorkerScreen,
})

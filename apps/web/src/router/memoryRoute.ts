import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateMemorySearch } from '../validators/validateMemorySearch'
import { shellRoute } from './shellRoute'

// Lazy: the flow route chunk is budgeted at 250 KB on its own (spec 11).
export const memoryRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/memory',
  validateSearch: validateMemorySearch,
  component: lazyRouteComponent(
    async () => import('../screens/memory/MemoryFlowScreen'),
    'MemoryFlowScreen',
  ),
})

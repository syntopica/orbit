import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateSystemSearch } from '../validators/validateSystemSearch'
import { shellRoute } from './shellRoute'

export const clipsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/clips',
  validateSearch: validateSystemSearch,
  component: lazyRouteComponent(
    async () => import('../screens/clips/ClipsScreen'),
    'ClipsScreen',
  ),
})

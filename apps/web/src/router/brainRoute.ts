import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateBrainSearch } from '../validators/validateBrainSearch'
import { shellRoute } from './shellRoute'

// Lazy: sigma, graphology and the Markdown renderer stay off the initial
// route; the chunk is budgeted at 250 KB with its worker (spec 11).
export const brainRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/brain',
  validateSearch: validateBrainSearch,
  component: lazyRouteComponent(
    async () => import('../screens/brain/BrainScreen'),
    'BrainScreen',
  ),
})

import { createRoute } from '@tanstack/react-router'

import { shellRoute } from './shellRoute'

export const systemRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/system',
})

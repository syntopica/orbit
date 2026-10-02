import { createRoute } from '@tanstack/react-router'

import { shellRoute } from './shellRoute'

export const homeRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
})

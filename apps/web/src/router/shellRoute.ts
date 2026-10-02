import { createRoute } from '@tanstack/react-router'

import { Shell } from '../components/shell/Shell'
import { rootRoute } from './rootRoute'

export const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell',
  component: Shell,
})

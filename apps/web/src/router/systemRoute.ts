import { createRoute } from '@tanstack/react-router'

import { SystemScreen } from '../screens/system/SystemScreen'
import { validateSystemSearch } from '../validators/validateSystemSearch'
import { shellRoute } from './shellRoute'

export const systemRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/system',
  validateSearch: validateSystemSearch,
  component: SystemScreen,
})

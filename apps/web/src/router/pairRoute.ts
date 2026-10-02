import { createRoute } from '@tanstack/react-router'

import { PairScreen } from '../screens/pair/PairScreen'
import { rootRoute } from './rootRoute'

export const pairRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pair',
  component: PairScreen,
})

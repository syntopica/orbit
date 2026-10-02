import { homeRoute } from './homeRoute'
import { loginRoute } from './loginRoute'
import { pairRoute } from './pairRoute'
import { rootRoute } from './rootRoute'
import { shellRoute } from './shellRoute'
import { systemRoute } from './systemRoute'

export const routeTree = rootRoute.addChildren([
  shellRoute.addChildren([homeRoute, systemRoute]),
  loginRoute,
  pairRoute,
])

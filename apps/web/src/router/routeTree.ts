import { loginRoute } from './loginRoute'
import { pairRoute } from './pairRoute'
import { rootRoute } from './rootRoute'

export const routeTree = rootRoute.addChildren([loginRoute, pairRoute])

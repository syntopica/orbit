import { atriumRoute } from './atriumRoute'
import { brainRoute } from './brainRoute'
import { clipsRoute } from './clipsRoute'
import { homeRoute } from './homeRoute'
import { loginRoute } from './loginRoute'
import { memoryRoute } from './memoryRoute'
import { pairRoute } from './pairRoute'
import { rootRoute } from './rootRoute'
import { shellRoute } from './shellRoute'
import { systemRoute } from './systemRoute'
import { workerRoute } from './workerRoute'

export const routeTree = rootRoute.addChildren([
  shellRoute.addChildren([
    homeRoute,
    memoryRoute,
    atriumRoute,
    brainRoute,
    clipsRoute,
    workerRoute,
    systemRoute,
  ]),
  loginRoute,
  pairRoute,
])

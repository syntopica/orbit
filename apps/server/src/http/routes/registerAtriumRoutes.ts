import type { Hono } from 'hono'

import type { AppDeps } from '../../types/AppDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { authBodyLimit } from './authBodyLimit'
import { getAtrium } from './getAtrium'
import { postAtriumContext } from './postAtriumContext'
import { requireActionRate } from './requireActionRate'

// The status view, and the context inspector: 10 queries a minute per session.
export const registerAtriumRoutes = (
  api: Hono<OrbitEnv>,
  deps: AppDeps,
  pool: DetailPool,
): void => {
  api.get('/atrium', getAtrium(deps.atrium, pool, deps.now))
  api.post(
    '/atrium/context',
    requireActionRate(deps, 'context'),
    authBodyLimit(),
    postAtriumContext(deps.atriumContext, pool, deps.now),
  )
}

import type { MiddlewareHandler } from 'hono'

import type { AppDeps } from '../../types/AppDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { actionRateAllowed } from './actionRateAllowed'

export const requireActionRate =
  (deps: AppDeps): MiddlewareHandler<OrbitEnv> =>
  async (c, next) => {
    if (!actionRateAllowed(deps, c))
      return c.json({ error: 'rate_limited' }, 429)
    return next()
  }

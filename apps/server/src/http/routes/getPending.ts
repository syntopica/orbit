import type { Handler } from 'hono'

import { collectPendingSources } from '../../pending/collectPendingSources'
import { mergePending } from '../../pending/mergePending'
import type { AppDeps } from '../../types/AppDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'

export const getPending =
  (deps: AppDeps, pool: DetailPool): Handler<OrbitEnv, string> =>
  async (c) => {
    const now = deps.now()
    return c.json(
      mergePending(await collectPendingSources(deps, pool, now), now),
    )
  }

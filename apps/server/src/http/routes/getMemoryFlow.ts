import type { Handler } from 'hono'

import { collectFlowInputs } from '../../flow/collectFlowInputs'
import { toMemoryFlow } from '../../flow/toMemoryFlow'
import type { DetailPool } from '../../types/DetailPool'
import type { FlowRouteDeps } from '../../types/FlowRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'

// An unreadable atrium leaves its stages unknown; the route still answers.
export const getMemoryFlow =
  (deps: FlowRouteDeps, pool: DetailPool): Handler<OrbitEnv, string> =>
  async (c) => {
    const atrium =
      deps.atrium === null
        ? null
        : await pool.run(deps.atrium.read, 4000).catch(() => null)
    return c.json(toMemoryFlow(collectFlowInputs(deps, atrium)))
  }

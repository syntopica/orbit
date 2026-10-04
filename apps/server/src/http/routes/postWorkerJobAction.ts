import { identifierSchema } from '@orbit/contract'
import type { Handler } from 'hono'

import type { AppDeps } from '../../types/AppDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { parseWorkerAction } from './parseWorkerAction'
import { workerAdminError } from './workerAdminError'

export const postWorkerJobAction =
  (
    deps: AppDeps,
    pool: DetailPool,
    action: 'cancel' | 'retry' | 'ack',
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    const id = identifierSchema.safeParse(c.req.param('id'))
    if (!id.success) return c.json({ error: 'bad_request' }, 400)
    const read = deps.workerJobs
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const result = await pool
      .run(
        async (signal) =>
          read(
            `/v1/admin/jobs/${encodeURIComponent(id.data)}/${action}`,
            'POST',
            null,
            signal,
          ),
        4000,
      )
      .catch(() => null)
    if (result === null) return c.json({ error: 'unavailable' }, 503)
    if (result.status !== 200 && result.status !== 201)
      return workerAdminError(c, result.status, result.body)
    const view = parseWorkerAction(result.body)
    if (view === null) return c.json({ error: 'unavailable' }, 503)
    deps.hub.publishEvent({
      at: new Date(deps.now()).toISOString(),
      component: 'worker',
      kind: 'worker.action',
      severity: 'info',
      refs: { id: id.data, action },
    })
    return c.json(view, result.status)
  }

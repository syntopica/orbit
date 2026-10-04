import { identifierSchema } from '@orbit/contract'
import type { Handler } from 'hono'
import { getCookie } from 'hono/cookie'

import type { AppDeps } from '../../types/AppDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { SESSION_COOKIE } from '../sessionCookieName'
import { parseWorkerContent } from './parseWorkerContent'
import { parseWorkerJobDetail } from './parseWorkerJobDetail'
import { revealPermission } from './revealPermission'
import { workerResultError } from './workerResultError'

export const getWorkerJobContent =
  (deps: AppDeps, pool: DetailPool): Handler<OrbitEnv, string> =>
  async (c) => {
    const id = identifierSchema.safeParse(c.req.param('id'))
    if (!id.success) return c.json({ error: 'bad_request' }, 400)
    const read = deps.workerJobs
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const path = `/v1/admin/jobs/${encodeURIComponent(id.data)}`
    const detail = await pool
      .run(async (signal) => read(path, 'GET', null, signal), 4000)
      .catch(() => null)
    const detailError = workerResultError(c, detail)
    if ('error' in detailError) return detailError.error
    const job = parseWorkerJobDetail(detailError.body)
    if (job === null) return c.json({ error: 'unavailable' }, 503)
    const permission = revealPermission({
      job,
      header: c.req.header('X-Orbit-Reveal'),
      db: deps.authDb,
      session: getCookie(c, SESSION_COOKIE) ?? '',
      now: deps.now(),
    })
    if (permission !== null) return c.json({ error: permission }, 403)
    const sensitive = ['personal', 'mail', 'secret'].includes(job.privacy)
    const result = await pool
      .run(
        async (signal) =>
          read(
            `${path}/content`,
            'GET',
            sensitive ? job.privacy : null,
            signal,
          ),
        4000,
      )
      .catch(() => null)
    const resultError = workerResultError(c, result)
    if ('error' in resultError) return resultError.error
    const content = parseWorkerContent(resultError.body)
    if (content === null) return c.json({ error: 'unavailable' }, 503)
    deps.hub.publishEvent({
      at: new Date(deps.now()).toISOString(),
      component: 'worker',
      kind: 'worker.revealed',
      severity: 'info',
      refs: { id: id.data, class: job.privacy },
    })
    return c.json(content)
  }

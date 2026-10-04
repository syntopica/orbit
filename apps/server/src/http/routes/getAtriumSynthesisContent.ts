import { synthesisJobKeySchema } from '@orbit/contract'
import type { Handler } from 'hono'

import type { AppDeps } from '../../types/AppDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { contextErrorCode } from './contextErrorCode'

// A synthesis is about the operator's work, so it is revealed like a
// worker job of class `personal`: only with `X-Orbit-Reveal: personal`, in
// this one response, never cached, and audited by key (spec 6.6, 7.4).
export const getAtriumSynthesisContent =
  (deps: AppDeps, pool: DetailPool): Handler<OrbitEnv, string> =>
  async (c) => {
    const key = synthesisJobKeySchema.safeParse(c.req.param('jobKey'))
    if (!key.success) return c.json({ error: 'bad_request' }, 400)
    const readers = deps.atriumSyntheses
    if (readers === null) return c.json({ error: 'unavailable' }, 503)
    if (c.req.header('X-Orbit-Reveal') !== 'personal')
      return c.json({ error: 'reveal_required' }, 403)
    const result = await pool
      .run(async (signal) => readers.record(key.data, signal), 6000)
      .then(
        (doc) => ({ doc }),
        (error: unknown) => ({ error: contextErrorCode(error) }),
      )
    if ('error' in result) return c.json({ error: result.error }, 503)
    deps.hub.publishEvent({
      at: new Date(deps.now()).toISOString(),
      component: 'atrium',
      kind: 'atrium.revealed',
      severity: 'info',
      refs: { id: key.data, class: 'personal' },
    })
    return c.json(result.doc.content)
  }

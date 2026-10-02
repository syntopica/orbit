import type { Handler } from 'hono'

import { recordAudit } from '../../auth/recordAudit'
import { redeemInvitation } from '../../auth/redeemInvitation'
import type { AuthRouteDeps } from '../../types/AuthRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { pairBodySchema } from './pairBodySchema'
import { rateAllowed } from './rateAllowed'
import { readJsonBody } from './readJsonBody'
import { setSessionCookie } from './setSessionCookie'

export const postPair =
  (deps: AuthRouteDeps): Handler<OrbitEnv, string> =>
  async (c) => {
    const allowed = rateAllowed(deps, c, 'pair')
    const body = pairBodySchema.safeParse(await readJsonBody(c))
    const session =
      allowed && body.success
        ? redeemInvitation(deps.db, body.data, deps.now())
        : null
    if (session === null) {
      recordAudit(deps.db, 'session.pair', 'denied', deps.now())
      return c.json({ error: 'unauthorized' }, 401)
    }
    setSessionCookie(c, session)
    recordAudit(deps.db, 'session.pair', 'ok', deps.now())
    return c.body(null, 204)
  }

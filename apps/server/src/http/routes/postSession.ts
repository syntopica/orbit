import type { Handler } from 'hono'

import { createSession } from '../../auth/createSession'
import { recordAudit } from '../../auth/recordAudit'
import { verifyAdminToken } from '../../auth/verifyAdminToken'
import type { AuthRouteDeps } from '../../types/AuthRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { rateAllowed } from './rateAllowed'
import { readJsonBody } from './readJsonBody'
import { setSessionCookie } from './setSessionCookie'
import { tokenBodySchema } from './tokenBodySchema'

export const postSession =
  (deps: AuthRouteDeps): Handler<OrbitEnv, string> =>
  async (c) => {
    const allowed = rateAllowed(deps, c, 'session')
    const body = tokenBodySchema.safeParse(await readJsonBody(c))
    if (
      !allowed ||
      !body.success ||
      !verifyAdminToken(deps.db, body.data.token)
    ) {
      recordAudit(deps.db, 'session.create', 'denied', deps.now())
      return c.json({ error: 'unauthorized' }, 401)
    }
    setSessionCookie(c, createSession(deps.db, deps.now()))
    recordAudit(deps.db, 'session.create', 'ok', deps.now())
    return c.body(null, 204)
  }

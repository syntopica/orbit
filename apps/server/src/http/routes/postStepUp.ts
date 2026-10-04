import type { Handler } from 'hono'
import { getCookie } from 'hono/cookie'

import { markStepUp } from '../../auth/markStepUp'
import { recordAudit } from '../../auth/recordAudit'
import { verifyAdminToken } from '../../auth/verifyAdminToken'
import type { AuthRouteDeps } from '../../types/AuthRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { SESSION_COOKIE } from '../sessionCookieName'
import { rateAllowed } from './rateAllowed'
import { readJsonBody } from './readJsonBody'
import { tokenBodySchema } from './tokenBodySchema'

export const postStepUp =
  (deps: AuthRouteDeps): Handler<OrbitEnv, string> =>
  async (c) => {
    const allowed = rateAllowed(deps, c, 'session')
    const body = tokenBodySchema.safeParse(await readJsonBody(c))
    const session = getCookie(c, SESSION_COOKIE)
    if (
      !allowed ||
      !body.success ||
      session === undefined ||
      !verifyAdminToken(deps.db, body.data.token) ||
      !markStepUp(deps.db, session, deps.now())
    ) {
      recordAudit(deps.db, 'session.step_up', 'denied', deps.now())
      return c.json({ error: 'unauthorized' }, 401)
    }
    recordAudit(deps.db, 'session.step_up', 'ok', deps.now())
    return c.body(null, 204)
  }

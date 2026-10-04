import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'

import { hasRecentStepUp } from '../../auth/hasRecentStepUp'
import type { AppDeps } from '../../types/AppDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { SESSION_COOKIE } from '../sessionCookieName'

// A disruptive action reached through a published (tailnet) host needs the
// admin token re-entered within the last five minutes; one sent on loopback,
// from the machine itself, does not. The host allowlist has already refused
// any other Host.
export const requireRemoteStepUp =
  (deps: AppDeps): MiddlewareHandler<OrbitEnv> =>
  async (c, next) => {
    const host = c.req.header('Host') ?? ''
    if (!deps.guard.allowedHosts.includes(host)) return next()
    const session = getCookie(c, SESSION_COOKIE) ?? ''
    if (hasRecentStepUp(deps.authDb, session, deps.now())) return next()
    return c.json({ error: 'step_up_required' }, 403)
  }

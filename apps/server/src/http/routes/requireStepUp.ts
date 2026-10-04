import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'

import { hasRecentStepUp } from '../../auth/hasRecentStepUp'
import type { AppDeps } from '../../types/AppDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { isLocalListener } from '../isLocalListener'
import { SESSION_COOKIE } from '../sessionCookieName'

// A disruptive action needs the admin token re-entered on this session within
// the last five minutes. The Host header is the client's to choose, so the
// only exemption is the listener itself: with `remotePort` set, Tailscale
// Serve publishes that port and requests on `port` come from the machine.
export const requireStepUp =
  (deps: AppDeps): MiddlewareHandler<OrbitEnv> =>
  async (c, next) => {
    if (isLocalListener(c, deps.guard)) return next()
    const session = getCookie(c, SESSION_COOKIE) ?? ''
    if (hasRecentStepUp(deps.authDb, session, deps.now())) return next()
    return c.json({ error: 'step_up_required' }, 403)
  }

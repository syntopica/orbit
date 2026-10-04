import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'

import { hasRecentStepUp } from '../../auth/hasRecentStepUp'
import type { AppDeps } from '../../types/AppDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { SESSION_COOKIE } from '../sessionCookieName'

// A disruptive action needs the admin token re-entered on this session within
// the last five minutes. Every session, local or remote: requests published by
// Tailscale Serve also arrive on loopback, and their Host header is the
// client's to choose, so neither can tell the two apart.
export const requireStepUp =
  (deps: AppDeps): MiddlewareHandler<OrbitEnv> =>
  async (c, next) => {
    const session = getCookie(c, SESSION_COOKIE) ?? ''
    if (hasRecentStepUp(deps.authDb, session, deps.now())) return next()
    return c.json({ error: 'step_up_required' }, 403)
  }

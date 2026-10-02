import type { Handler } from 'hono'
import { deleteCookie, getCookie } from 'hono/cookie'

import { deleteSession } from '../../auth/deleteSession'
import { recordAudit } from '../../auth/recordAudit'
import type { AuthRouteDeps } from '../../types/AuthRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { SESSION_COOKIE } from '../sessionCookieName'
import { SESSION_COOKIE_OPTIONS } from './sessionCookieOptions'

// Mounted behind requireSession, so the cookie is present and bounded.
export const postLogout =
  (deps: AuthRouteDeps): Handler<OrbitEnv, string> =>
  (c) => {
    const id = getCookie(c, SESSION_COOKIE)
    if (id !== undefined) deleteSession(deps.db, id)
    deleteCookie(c, SESSION_COOKIE, SESSION_COOKIE_OPTIONS)
    recordAudit(deps.db, 'session.logout', 'ok', deps.now())
    return c.body(null, 204)
  }

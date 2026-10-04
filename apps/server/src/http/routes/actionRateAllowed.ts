import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { createHash } from 'node:crypto'

import { consumeRateLimit } from '../../auth/consumeRateLimit'
import type { AppDeps } from '../../types/AppDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { SESSION_COOKIE } from '../sessionCookieName'

export const actionRateAllowed = (
  deps: AppDeps,
  c: Context<OrbitEnv>,
): boolean => {
  const cookie = getCookie(c, SESSION_COOKIE) ?? ''
  const hash = createHash('sha256').update(cookie).digest('hex')
  return consumeRateLimit(
    deps.authDb,
    { key: `action:${hash}`, limit: 10 },
    deps.now(),
  )
}

import type { MiddlewareHandler, Next } from 'hono'

import type { GuardContext } from '../types/GuardContext'

export const requireCsrfHeader =
  (): MiddlewareHandler => async (c: GuardContext, next: Next) => {
    const safe = c.req.method === 'GET' || c.req.method === 'HEAD'
    if (!safe && c.req.header('X-Orbit') !== '1') {
      return c.json({ error: 'forbidden' }, 403)
    }
    return next()
  }

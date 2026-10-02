import type { MiddlewareHandler, Next } from 'hono'

import type { GuardConfig } from '../types/GuardConfig'
import type { GuardContext } from '../types/GuardContext'
import { allowedOrigins } from './allowedOrigins'

export const requireSameOrigin = (config: GuardConfig): MiddlewareHandler => {
  const origins = new Set(allowedOrigins(config))
  return async (c: GuardContext, next: Next) => {
    const origin = c.req.header('Origin')
    const readOnly = c.req.method === 'GET' || c.req.method === 'HEAD'
    const sameOrigin =
      origin === undefined
        ? readOnly && c.req.header('Sec-Fetch-Site') === 'same-origin'
        : origins.has(origin)
    if (!sameOrigin) return c.json({ error: 'forbidden' }, 403)
    return next()
  }
}

import type { MiddlewareHandler, Next } from 'hono'

import type { GuardContext } from '../types/GuardContext'

import type { GuardConfig } from '../types/GuardConfig'
import { allowedOrigins } from './allowedOrigins'

export const requireSameOrigin = (config: GuardConfig): MiddlewareHandler => {
  const origins = new Set(allowedOrigins(config))
  return async (c: GuardContext, next: Next) => {
    const origin = c.req.header('Origin')
    const sameOrigin =
      origin === undefined
        ? c.req.header('Sec-Fetch-Site') === 'same-origin'
        : origins.has(origin)
    if (!sameOrigin) return c.json({ error: 'forbidden' }, 403)
    return next()
  }
}

import type { MiddlewareHandler, Next } from 'hono'

import type { GuardContext } from '../types/GuardContext'

export const securityHeaders =
  (): MiddlewareHandler => async (c: GuardContext, next: Next) => {
    await next()
    c.header(
      'Content-Security-Policy',
      "default-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; object-src 'none'",
    )
    c.header('Referrer-Policy', 'no-referrer')
    c.header('X-Content-Type-Options', 'nosniff')
    if (c.req.path.startsWith('/api/')) c.header('Cache-Control', 'no-store')
  }

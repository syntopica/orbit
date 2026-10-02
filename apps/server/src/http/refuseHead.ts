import type { MiddlewareHandler, Next } from 'hono'

import type { GuardContext } from '../types/GuardContext'

// Hono answers HEAD by running the GET handler and dropping its body without
// cancelling it, so a streaming route must refuse HEAD before it starts.
export const refuseHead =
  (): MiddlewareHandler => async (c: GuardContext, next: Next) => {
    if (c.req.method === 'HEAD') {
      return c.json({ error: 'method_not_allowed' }, 405)
    }
    return next()
  }

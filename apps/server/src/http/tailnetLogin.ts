import type { MiddlewareHandler, Next } from 'hono'

import type { GuardConfig } from '../types/GuardConfig'
import type { GuardContext } from '../types/GuardContext'

export const tailnetLogin = (config: GuardConfig): MiddlewareHandler => {
  const logins = new Set(config.allowedLogins)
  return async (c: GuardContext, next: Next) => {
    const login = c.req.header('Tailscale-User-Login')
    if (login !== undefined && !logins.has(login)) {
      return c.json({ error: 'forbidden' }, 403)
    }
    return next()
  }
}

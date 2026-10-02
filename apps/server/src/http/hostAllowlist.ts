import type { MiddlewareHandler, Next } from 'hono'

import type { GuardConfig } from '../types/GuardConfig'
import type { GuardContext } from '../types/GuardContext'

export const hostAllowlist = (config: GuardConfig): MiddlewareHandler => {
  const hosts = new Set([
    `127.0.0.1:${String(config.port)}`,
    `localhost:${String(config.port)}`,
    ...config.allowedHosts,
  ])
  return async (c: GuardContext, next: Next) => {
    if (!hosts.has(c.req.header('Host') ?? '')) {
      return c.json({ error: 'misdirected' }, 421)
    }
    return next()
  }
}

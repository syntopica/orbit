import type { MiddlewareHandler, Next } from 'hono'

import { getCookie } from 'hono/cookie'
import type { DatabaseSync } from 'node:sqlite'
import type { GuardContext } from '../types/GuardContext'

import { touchSession } from '../auth/touchSession'
import { MAX_SESSION_COOKIE_LENGTH } from './maxSessionCookieLength'
import { SESSION_COOKIE } from './sessionCookieName'

export const requireSession =
  (db: DatabaseSync, now: () => number): MiddlewareHandler =>
  async (c: GuardContext, next: Next) => {
    const id = getCookie(c, SESSION_COOKIE)
    const live =
      id !== undefined &&
      id.length <= MAX_SESSION_COOKIE_LENGTH &&
      touchSession(db, id, now())
    if (!live) return c.json({ error: 'unauthorized' }, 401)
    return next()
  }

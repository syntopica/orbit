import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'

import type { OrbitEnv } from '../../types/OrbitEnv'
import { SESSION_COOKIE } from '../sessionCookieName'
import { SESSION_COOKIE_OPTIONS } from './sessionCookieOptions'

export const setSessionCookie = (
  c: Context<OrbitEnv, string>,
  id: string,
): void => {
  setCookie(c, SESSION_COOKIE, id, SESSION_COOKIE_OPTIONS)
}

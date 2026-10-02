import type { CookieOptions } from 'hono/utils/cookie'

import { AUTH_DURATIONS } from '../../auth/authDurations'

// `__Host-` requires Secure, Path=/ and no Domain.
export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  path: '/',
  maxAge: AUTH_DURATIONS.sessionAbsoluteMs / 1000,
}

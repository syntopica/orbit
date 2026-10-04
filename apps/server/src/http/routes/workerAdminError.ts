import type { Context } from 'hono'

import type { OrbitEnv } from '../../types/OrbitEnv'
import { workerErrorCode } from './workerErrorCode'

// The worker's response body is never copied into orbit's error response.
export const workerAdminError = (
  c: Context<OrbitEnv, string>,
  status: number,
  body: string,
): Response => {
  const code = workerErrorCode(body)
  switch (`${String(status)}:${String(code)}`) {
    case '400:unknown_queue':
      return c.json({ error: 'unknown_queue' }, 400)
    case '400:unknown_state':
      return c.json({ error: 'unknown_state' }, 400)
    case '400:bad_cursor':
      return c.json({ error: 'bad_cursor' }, 400)
    case '403:reveal_required':
      return c.json({ error: 'reveal_required' }, 403)
    case '409:not_retryable':
      return c.json({ error: 'not_retryable' }, 409)
    case '409:not_ackable':
      return c.json({ error: 'not_ackable' }, 409)
    case '429:outstanding_limit':
      return c.json({ error: 'outstanding_limit' }, 429)
    default:
      break
  }
  if (status === 404) return c.json({ error: 'not_found' }, 404)
  if (status === 410) return c.json({ error: 'content_gone' }, 410)
  return c.json({ error: 'unavailable' }, 503)
}

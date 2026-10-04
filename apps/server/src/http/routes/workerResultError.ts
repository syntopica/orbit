import type { Context } from 'hono'

import type { OrbitEnv } from '../../types/OrbitEnv'
import { workerAdminError } from './workerAdminError'

export const workerResultError = (
  c: Context<OrbitEnv, string>,
  result: { status: number; body: string } | null,
): { error: Response } | { body: string } => {
  if (result === null) return { error: c.json({ error: 'unavailable' }, 503) }
  if (result.status !== 200)
    return { error: workerAdminError(c, result.status, result.body) }
  return { body: result.body }
}

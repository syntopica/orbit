import type { Context } from 'hono'

import type { OrbitEnv } from '../../types/OrbitEnv'
import type { WorkerAdminResult } from '../../types/WorkerAdminResult'
import type { WorkerResultBody } from '../../types/WorkerResultBody'
import type { WorkerResultErrorResponse } from '../../types/WorkerResultErrorResponse'
import { workerAdminError } from './workerAdminError'

export const workerResultError = (
  c: Context<OrbitEnv, string>,
  result: WorkerAdminResult | null,
): WorkerResultErrorResponse | WorkerResultBody => {
  if (result === null) return { error: c.json({ error: 'unavailable' }, 503) }
  if (result.status !== 200)
    return { error: workerAdminError(c, result.status, result.body) }
  return { body: result.body }
}

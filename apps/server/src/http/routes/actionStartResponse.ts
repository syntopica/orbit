import type { Context } from 'hono'

import type { ActionAlreadyRunning } from '../../types/ActionAlreadyRunning'
import type { ActionStartedRun } from '../../types/ActionStartedRun'
import type { OrbitEnv } from '../../types/OrbitEnv'

export const actionStartResponse = (
  c: Context<OrbitEnv>,
  result: ActionStartedRun | ActionAlreadyRunning,
): Response =>
  'startedAt' in result
    ? c.json({ error: 'already_running', startedAt: result.startedAt }, 409)
    : c.json({ id: result.run.id, state: 'started' }, 202)

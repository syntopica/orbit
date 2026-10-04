import type { Context } from 'hono'

import type { ActionRun } from '../../types/ActionRun'
import type { OrbitEnv } from '../../types/OrbitEnv'

export const actionStartResponse = (
  c: Context<OrbitEnv>,
  result: { run: ActionRun } | { startedAt: number },
): Response =>
  'startedAt' in result
    ? c.json({ error: 'already_running', startedAt: result.startedAt }, 409)
    : c.json({ id: result.run.id, state: 'started' }, 202)

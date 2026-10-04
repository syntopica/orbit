import type { Hono } from 'hono'

import type { AppDeps } from '../../types/AppDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { getWorkerJob } from './getWorkerJob'
import { getWorkerJobContent } from './getWorkerJobContent'
import { getWorkerJobs } from './getWorkerJobs'
import { postWorkerJobAction } from './postWorkerJobAction'
import { requireRemoteStepUp } from './requireRemoteStepUp'

export const registerWorkerJobRoutes = (
  api: Hono<OrbitEnv>,
  deps: AppDeps,
  pool: DetailPool,
): void => {
  api.get('/worker/jobs', getWorkerJobs(deps.workerJobs, pool))
  api.get('/worker/jobs/:id', getWorkerJob(deps.workerJobs, pool))
  api.get('/worker/jobs/:id/content', getWorkerJobContent(deps, pool))
  const stepUp = requireRemoteStepUp(deps)
  for (const action of ['cancel', 'retry', 'ack'] as const)
    api.post(
      `/worker/jobs/:id/${action}`,
      stepUp,
      postWorkerJobAction(deps, pool, action),
    )
}

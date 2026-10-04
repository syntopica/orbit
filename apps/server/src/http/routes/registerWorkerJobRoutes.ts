import type { Hono } from 'hono'

import type { AppDeps } from '../../types/AppDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { getWorkerJob } from './getWorkerJob'
import { getWorkerJobContent } from './getWorkerJobContent'
import { getWorkerJobs } from './getWorkerJobs'
import { postWorkerJobAction } from './postWorkerJobAction'

export const registerWorkerJobRoutes = (
  api: Hono<OrbitEnv>,
  deps: AppDeps,
  pool: DetailPool,
): void => {
  api.get('/worker/jobs', getWorkerJobs(deps.workerJobs, pool))
  api.get('/worker/jobs/:id', getWorkerJob(deps.workerJobs, pool))
  api.get('/worker/jobs/:id/content', getWorkerJobContent(deps, pool))
  api.post('/worker/jobs/:id/cancel', postWorkerJobAction(deps, pool, 'cancel'))
  api.post('/worker/jobs/:id/retry', postWorkerJobAction(deps, pool, 'retry'))
  api.post('/worker/jobs/:id/ack', postWorkerJobAction(deps, pool, 'ack'))
}

import type { Hono } from 'hono'

import type { AppDeps } from '../../types/AppDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { getWorker } from './getWorker'
import { getWorkerActivity } from './getWorkerActivity'
import { getWorkerCosts } from './getWorkerCosts'
import { getWorkerQuality } from './getWorkerQuality'

export const registerWorkerDetailRoutes = (
  api: Hono<OrbitEnv>,
  deps: AppDeps,
  pool: DetailPool,
): void => {
  api.get('/worker', getWorker(deps.worker, pool, deps.now))
  api.get(
    '/worker/activity',
    getWorkerActivity(deps.workerActivity, pool, deps.now),
  )
  api.get('/worker/costs', getWorkerCosts(deps.workerCosts, pool, deps.now))
  api.get(
    '/worker/quality',
    getWorkerQuality(deps.workerQuality, pool, deps.now),
  )
}

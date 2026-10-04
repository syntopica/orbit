import { fetchWorkerAdmin } from '../adapters/worker/fetchWorkerAdmin'
import type { OrbitConfig } from '../types/OrbitConfig'
import type { WorkerJobClient } from '../types/WorkerJobClient'

export const buildWorkerJobClient = (
  worker: OrbitConfig['worker'],
  fetcher: typeof fetch,
): WorkerJobClient | null =>
  worker === undefined ? null : fetchWorkerAdmin({ ...worker, fetch: fetcher })

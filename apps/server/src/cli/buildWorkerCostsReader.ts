import { fetchWorkerCosts } from '../adapters/worker/fetchWorkerCosts'
import type { OrbitConfig } from '../types/OrbitConfig'
import type { WorkerCostsReader } from '../types/WorkerCostsReader'

export const buildWorkerCostsReader = (
  worker: OrbitConfig['worker'],
  fetcher: typeof fetch,
): WorkerCostsReader | null =>
  worker === undefined
    ? null
    : async (days, signal) =>
        fetchWorkerCosts({ ...worker, fetch: fetcher }, days, signal)

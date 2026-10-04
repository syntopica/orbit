import { fetchWorkerQuality } from '../adapters/worker/fetchWorkerQuality'
import type { OrbitConfig } from '../types/OrbitConfig'
import type { WorkerQualityReader } from '../types/WorkerQualityReader'

export const buildWorkerQualityReader = (
  worker: OrbitConfig['worker'],
  fetcher: typeof fetch,
): WorkerQualityReader | null =>
  worker === undefined
    ? null
    : async (days, signal) =>
        fetchWorkerQuality({ ...worker, fetch: fetcher }, days, signal)

import { fetchWorkerStatus } from '../adapters/worker/fetchWorkerStatus'
import type { OrbitConfig } from '../types/OrbitConfig'
import type { WorkerReader } from '../types/WorkerReader'

// The detail route's own read: the token is re-read per call, as the adapter does.
export const buildWorkerReader = (
  worker: OrbitConfig['worker'],
  fetcher: typeof fetch,
): WorkerReader | null =>
  worker === undefined
    ? null
    : async (signal) => fetchWorkerStatus({ ...worker, fetch: fetcher }, signal)

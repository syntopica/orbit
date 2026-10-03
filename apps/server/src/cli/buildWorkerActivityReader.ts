import { fetchWorkerActivity } from '../adapters/worker/fetchWorkerActivity'
import type { OrbitConfig } from '../types/OrbitConfig'
import type { WorkerActivityReader } from '../types/WorkerActivityReader'

// The activity route's read: the token is re-read per call, as the adapter does.
export const buildWorkerActivityReader = (
  worker: OrbitConfig['worker'],
  fetcher: typeof fetch,
): WorkerActivityReader | null =>
  worker === undefined
    ? null
    : async (hours, signal) =>
        fetchWorkerActivity({ ...worker, fetch: fetcher }, hours, signal)

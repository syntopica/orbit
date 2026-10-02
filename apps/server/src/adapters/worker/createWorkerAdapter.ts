import type { Adapter } from '../../types/Adapter'
import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import { fetchWorkerStatus } from './fetchWorkerStatus'
import { summarizeWorker } from './summarizeWorker'
import { workerEvents } from './workerEvents'

export const createWorkerAdapter = (deps: WorkerAdapterDeps): Adapter => {
  let seen: { failures: Set<string>; cooldowns: Set<string> } | null = null
  return {
    id: 'worker',
    cadenceMs: deps.cadenceMs,
    timeoutMs: Math.min(4000, deps.cadenceMs),
    freshnessMs: deps.cadenceMs * 2,
    read: async (signal) => {
      const status = await fetchWorkerStatus(deps, signal)
      const now = new Date()
      const events = workerEvents(seen, status, now)
      seen = {
        failures: new Set(status.recent_failures.map((f) => f.id)),
        cooldowns: new Set(Object.keys(status.cooldowns)),
      }
      return {
        component: 'worker',
        ...summarizeWorker(status, now),
        events,
        observedAt: now.toISOString(),
      }
    },
  }
}

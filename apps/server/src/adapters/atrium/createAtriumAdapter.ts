import type { Adapter } from '../../types/Adapter'
import { readAtriumDocuments } from './readAtriumDocuments'
import { summarizeAtrium } from './summarizeAtrium'

// Reads the documents atrium's jobs publish; never runs atrium itself.
export const createAtriumAdapter = (deps: {
  readonly statusDir: string
  readonly refreshIntervalMs: number
  readonly cadenceMs: number
}): Adapter => ({
  id: 'atrium',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 5000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const { refresh, synthesis } = await readAtriumDocuments(
      deps.statusDir,
      signal,
    )
    const now = new Date()
    return {
      component: 'atrium',
      ...summarizeAtrium(refresh, synthesis, deps.refreshIntervalMs, now),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})

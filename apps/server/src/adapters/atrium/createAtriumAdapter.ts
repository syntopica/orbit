import type { Adapter } from '../../types/Adapter'
import type { AtriumAdapterDeps } from '../../types/AtriumAdapterDeps'
import { readAtriumDocuments } from './readAtriumDocuments'
import { summarizeAtrium } from './summarizeAtrium'

// Reads the documents atrium's jobs publish. The only command it may run is
// `synthesis passes` (a log tail), and a failure there only drops the pass
// warning: the status files stay the card's source of truth.
export const createAtriumAdapter = (deps: AtriumAdapterDeps): Adapter => ({
  id: 'atrium',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 5000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const docs = await readAtriumDocuments(deps.statusDir, signal)
    const passes =
      deps.readPasses === undefined
        ? null
        : await deps.readPasses(signal).catch(() => null)
    const now = new Date()
    return {
      component: 'atrium',
      ...summarizeAtrium(docs, deps.refreshIntervalMs, now, passes),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})

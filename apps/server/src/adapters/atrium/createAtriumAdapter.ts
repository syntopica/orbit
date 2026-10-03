import { join } from 'node:path'

import { ProcessError } from '../../process/ProcessError'
import type { Adapter } from '../../types/Adapter'
import { atriumRefreshSchema } from './atriumRefreshSchema'
import { atriumSynthesisSchema } from './atriumSynthesisSchema'
import { readStatusFile } from './readStatusFile'
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
    const file = (name: string) => join(deps.statusDir, name)
    const refresh = await readStatusFile(
      file('refresh.json'),
      atriumRefreshSchema,
      signal,
    )
    if (refresh === null) throw new ProcessError('not_found')
    const synthesis = await readStatusFile(
      file('synthesis.json'),
      atriumSynthesisSchema,
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

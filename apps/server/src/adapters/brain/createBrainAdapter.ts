import type { Adapter } from '../../types/Adapter'
import type { EngineRunner } from '../../types/EngineRunner'
import { readBrainChecks } from './readBrainChecks'
import { summarizeBrain } from './summarizeBrain'

export const createBrainAdapter = (deps: {
  readonly run: EngineRunner
  readonly cadenceMs: number
}): Adapter => ({
  id: 'brain',
  cadenceMs: deps.cadenceMs,
  // Two sequential engine reads, each up to its engine's `timeoutMs` (20 s at
  // most in practice), inside the 60 s cadence.
  timeoutMs: 45_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const { lint, doctor } = await readBrainChecks(deps.run, signal)
    const now = new Date()
    return {
      component: 'brain',
      ...summarizeBrain(lint, doctor, now),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})

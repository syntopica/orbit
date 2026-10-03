import type { Adapter } from '../../types/Adapter'
import type { EngineRunner } from '../../types/EngineRunner'
import { readClipsDocuments } from './readClipsDocuments'
import { summarizeClips } from './summarizeClips'

export const createClipsAdapter = (deps: {
  readonly run: EngineRunner
  readonly cadenceMs: number
}): Adapter => ({
  id: 'clips',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 25_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const { status, doctor } = await readClipsDocuments(deps.run, signal)
    const now = new Date()
    return {
      component: 'clips',
      ...summarizeClips(status, doctor, now),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})

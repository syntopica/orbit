import type { Adapter } from '../../types/Adapter'
import type { EngineRunner } from '../../types/EngineRunner'
import type { LatestClipsDocuments } from '../../types/LatestClipsDocuments'
import { backlogHealth } from '../backlogHealth'
import { clipsOldestOver } from './clipsOldestOver'
import { readClipsDocuments } from './readClipsDocuments'
import { summarizeClips } from './summarizeClips'

// The snapshot keeps counts only; the whole read, items included, goes to
// `latest` for the detail route and the pending board.
export const createClipsAdapter = (deps: {
  readonly run: EngineRunner
  readonly cadenceMs: number
  readonly oldestDays?: number | undefined
  readonly latest?: LatestClipsDocuments | undefined
}): Adapter => ({
  id: 'clips',
  cadenceMs: deps.cadenceMs,
  // Two sequential engine reads, each up to its engine's `timeoutMs` (20 s at
  // most in practice), inside the 60 s cadence.
  timeoutMs: 45_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const documents = await readClipsDocuments(deps.run, signal)
    deps.latest?.put(documents)
    const now = new Date()
    const summary = summarizeClips(documents.status, documents.doctor, now)
    const over = clipsOldestOver(summary.pending, deps.oldestDays, now)
    return {
      component: 'clips',
      ...summary,
      health: backlogHealth(summary.health, over),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})

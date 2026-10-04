import type { Adapter } from '../../types/Adapter'
import type { EngineRunner } from '../../types/EngineRunner'
import { backlogHealth } from '../backlogHealth'
import { clipsOldestOver } from './clipsOldestOver'
import { readClipsDocuments } from './readClipsDocuments'
import { summarizeClips } from './summarizeClips'

export const createClipsAdapter = (deps: {
  readonly run: EngineRunner
  readonly cadenceMs: number
  readonly oldestDays?: number | undefined
}): Adapter => ({
  id: 'clips',
  cadenceMs: deps.cadenceMs,
  // Two sequential engine reads, each up to its engine's `timeoutMs` (20 s at
  // most in practice), inside the 60 s cadence.
  timeoutMs: 45_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const { status, doctor } = await readClipsDocuments(deps.run, signal)
    const now = new Date()
    const summary = summarizeClips(status, doctor, now)
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

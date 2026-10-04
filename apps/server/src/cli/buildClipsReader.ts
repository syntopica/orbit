import { readClipsDocuments } from '../adapters/clips/readClipsDocuments'
import { createFailedEngineRunner } from '../adapters/createFailedEngineRunner'
import { createTtlCache } from '../scheduler/createTtlCache'
import type { ClipsDocuments } from '../types/ClipsDocuments'
import type { ClipsReader } from '../types/ClipsReader'
import type { EngineRunner } from '../types/EngineRunner'
import type { LatestClipsDocuments } from '../types/LatestClipsDocuments'

// Configured but unresolved reads fail like the adapter does (not_found).
// The adapter's last read is served while it is within two cadences, so an
// open Clips screen adds no engine run of its own; past that, one run per
// cadence, kept for the adapter too.
export const buildClipsReader = (
  run: EngineRunner | undefined,
  configured: boolean,
  cadenceMs: number,
  latest?: LatestClipsDocuments,
): ClipsReader | null => {
  if (!configured) return null
  const runner = run ?? createFailedEngineRunner
  const cached = createTtlCache<ClipsDocuments>(cadenceMs, Date.now)
  return async (signal) =>
    latest?.get(cadenceMs * 2) ??
    cached(async () => {
      const documents = await readClipsDocuments(runner, signal)
      latest?.put(documents)
      return documents
    })
}

import { readClipsDocuments } from '../adapters/clips/readClipsDocuments'
import { createFailedEngineRunner } from '../adapters/createFailedEngineRunner'
import { createTtlCache } from '../scheduler/createTtlCache'
import type { ClipsDocuments } from '../types/ClipsDocuments'
import type { ClipsReader } from '../types/ClipsReader'
import type { EngineRunner } from '../types/EngineRunner'

// Configured but unresolved reads fail like the adapter does (not_found).
export const buildClipsReader = (
  run: EngineRunner | undefined,
  configured: boolean,
  cadenceMs: number,
): ClipsReader | null => {
  if (!configured) return null
  const runner = run ?? createFailedEngineRunner
  const cached = createTtlCache<ClipsDocuments>(cadenceMs, Date.now)
  return async (signal) =>
    cached(async () => readClipsDocuments(runner, signal))
}

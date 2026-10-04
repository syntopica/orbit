import { readAtriumPasses } from '../adapters/atrium/readAtriumPasses'
import { readAtriumRecent } from '../adapters/atrium/readAtriumRecent'
import { readAtriumRecord } from '../adapters/atrium/readAtriumRecord'
import { createFailedEngineRunner } from '../adapters/createFailedEngineRunner'
import { createTtlCache } from '../scheduler/createTtlCache'
import type { AtriumPassesDocument } from '../types/AtriumPassesDocument'
import type { AtriumRecentDocument } from '../types/AtriumRecentDocument'
import type { AtriumSynthesisReaders } from '../types/AtriumSynthesisReaders'
import type { EngineRunner } from '../types/EngineRunner'

// Recent records cost seconds, so they are held five minutes; passes for the
// atrium cadence. A record's content is never cached (spec 6.6).
export const buildAtriumSynthesisReaders = (
  run: EngineRunner | undefined,
  configured: boolean,
  cadenceMs: number,
): AtriumSynthesisReaders | null => {
  if (!configured) return null
  const runner = run ?? createFailedEngineRunner
  const passes = createTtlCache<AtriumPassesDocument>(cadenceMs, Date.now)
  const recent = createTtlCache<AtriumRecentDocument>(300_000, Date.now)
  return {
    passes: async (signal) =>
      passes(async () => readAtriumPasses(runner, signal)),
    recent: async (signal) =>
      recent(async () => readAtriumRecent(runner, signal)),
    record: async (jobKey, signal) => readAtriumRecord(runner, jobKey, signal),
  }
}

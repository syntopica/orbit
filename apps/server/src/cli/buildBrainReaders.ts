import { readBrainChecks } from '../adapters/brain/readBrainChecks'
import { readBrainGraph } from '../adapters/brain/readBrainGraph'
import { readBrainPage } from '../adapters/brain/readBrainPage'
import { readBrainRelated } from '../adapters/brain/readBrainRelated'
import { createFailedEngineRunner } from '../adapters/createFailedEngineRunner'
import { createKeyedTtlCache } from '../scheduler/createKeyedTtlCache'
import { createTtlCache } from '../scheduler/createTtlCache'
import type { BrainChecksDocuments } from '../types/BrainChecksDocuments'
import type { BrainGraphDocument } from '../types/BrainGraphDocument'
import type { BrainPageDocument } from '../types/BrainPageDocument'
import type { BrainReaders } from '../types/BrainReaders'
import type { BrainRelatedDocument } from '../types/BrainRelatedDocument'
import type { EngineRunner } from '../types/EngineRunner'

// The brain detail reads (spec 7.5), each cached for the brain cadence; pages
// per id, at most 16. Configured but unresolved reads fail not_found.
export const buildBrainReaders = (
  run: EngineRunner | undefined,
  configured: boolean,
  cadenceMs: number,
  now: () => number = Date.now,
): BrainReaders | null => {
  if (!configured) return null
  const runner = run ?? createFailedEngineRunner
  const graph = createTtlCache<BrainGraphDocument>(cadenceMs, now)
  const related = createTtlCache<BrainRelatedDocument>(cadenceMs, now)
  const checks = createTtlCache<BrainChecksDocuments>(cadenceMs, now)
  const pages = createKeyedTtlCache<BrainPageDocument>(cadenceMs, now, 16)
  return {
    graph: async (signal) => graph(async () => readBrainGraph(runner, signal)),
    related: async (signal) =>
      related(async () => readBrainRelated(runner, signal)),
    checks: async (signal) =>
      checks(async () => readBrainChecks(runner, signal)),
    page: async (id, signal) =>
      pages(id, async () => readBrainPage(runner, id, signal)),
  }
}

import type { WorkerQuality } from '@orbit/contract'

import type { WorkerQualityReport } from '../types/WorkerQualityReport'
import { identifierOrNull } from './identifierOrNull'
import { isIdentifier } from './isIdentifier'

export const toQualityRatings = (
  rows: WorkerQualityReport['ratings'],
): WorkerQuality['ratings'] =>
  rows
    .filter(
      (row) =>
        isIdentifier(row.queue) &&
        isIdentifier(row.provider) &&
        isIdentifier(row.model),
    )
    .map((row) => ({
      queue: row.queue,
      tier: identifierOrNull(row.tier),
      provider: row.provider,
      model: row.model,
      results: row.results,
      rated: row.rated,
      good: row.good,
      edited: row.edited,
      discarded: row.discarded,
    }))

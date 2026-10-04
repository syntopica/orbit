import type { WorkerQualityJudged } from '@orbit/contract'

import type { WorkerQualityReport } from '../types/WorkerQualityReport'
import { isIdentifier } from './isIdentifier'

export const toQualityJudged = (
  rows: WorkerQualityReport['judged'],
): WorkerQualityJudged[] =>
  rows
    .filter(
      (row) =>
        isIdentifier(row.queue) &&
        isIdentifier(row.provider) &&
        isIdentifier(row.model),
    )
    .map((row) => ({
      queue: row.queue,
      provider: row.provider,
      model: row.model,
      judged: row.judged,
      meanScore: row.mean_score,
      best: row.best,
    }))

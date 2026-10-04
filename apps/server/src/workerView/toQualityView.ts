import type { WorkerQuality } from '@orbit/contract'

import type { WorkerQualityReport } from '../types/WorkerQualityReport'
import { toQualityAttempts } from './toQualityAttempts'
import { toQualityJudged } from './toQualityJudged'
import { toQualityRatings } from './toQualityRatings'

export const toQualityView = (
  report: WorkerQualityReport,
  now: number,
): WorkerQuality => ({
  now,
  attempts: toQualityAttempts(report.attempts),
  ratings: toQualityRatings(report.ratings),
  judged: toQualityJudged(report.judged),
})

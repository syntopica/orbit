import { ACTIVITY_SERIES_ORDER } from '../charts/activitySeriesOrder'
import type { ActivityAccumulator } from '../types/ActivityAccumulator'
import type { ActivityColumn } from '../types/ActivityColumn'
import { foldTopCounts } from './foldTopCounts'
import { meanOrNull } from './meanOrNull'
import { orderedCounts } from './orderedCounts'

export const toActivityColumn = (
  acc: ActivityAccumulator,
  start: number,
  bucketMs: number,
): ActivityColumn => ({
  start,
  end: start + bucketMs,
  segments: orderedCounts(acc.segments, ACTIVITY_SERIES_ORDER),
  total: acc.attempts,
  failed: acc.segments.get('failed') ?? 0,
  sampling: acc.sampling,
  meanWallMs: meanOrNull(acc.wallMs, acc.attempts),
  errors: foldTopCounts(acc.errors, 3),
})

import type { WorkerActivity } from '@orbit/contract'

import type { FailureChartModel } from '../types/FailureChartModel'
import { addCount } from './addCount'
import { bucketIndex } from './bucketIndex'
import { foldTopCounts } from './foldTopCounts'
import { orderedCounts } from './orderedCounts'

// Production failures per bucket by error code: the range's top four codes,
// everything else folded into "other".
export const selectFailureColumns = (
  view: WorkerActivity,
  starts: readonly number[],
): FailureChartModel => {
  const failed = view.rows.filter((r) => !r.sampling && r.outcome === 'failed')
  const totals = new Map<string, number>()
  for (const row of failed)
    addCount(totals, row.error ?? 'no code', row.attempts)
  const keys = foldTopCounts(totals, 4).map((entry) => entry.key)
  const buckets = starts.map(() => new Map<string, number>())
  for (const row of failed) {
    const code = row.error ?? 'no code'
    const slot = buckets[bucketIndex(starts, view.bucketMs, row.bucket)]
    if (slot !== undefined) {
      addCount(slot, keys.includes(code) ? code : 'other', row.attempts)
    }
  }
  const columns = buckets.map((counts, i) => {
    const segments = orderedCounts(counts, keys)
    const start = starts[i] ?? 0
    const total = segments.reduce((sum, s) => sum + s.count, 0)
    return { start, end: start + view.bucketMs, segments, total }
  })
  return { keys, columns }
}

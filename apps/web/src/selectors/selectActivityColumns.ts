import type { WorkerActivity } from '@orbit/contract'

import type { ActivityAccumulator } from '../types/ActivityAccumulator'
import type { ActivityColumn } from '../types/ActivityColumn'
import { addCount } from './addCount'
import { bucketIndex } from './bucketIndex'
import { providerSeries } from './providerSeries'
import { toActivityColumn } from './toActivityColumn'

// Production attempts per bucket by provider, failures as their own segment;
// sampling (shadow and judge) attempts are only counted, never stacked.
export const selectActivityColumns = (
  view: WorkerActivity,
  starts: readonly number[],
): ActivityColumn[] => {
  const acc: ActivityAccumulator[] = starts.map(() => ({
    segments: new Map(),
    errors: new Map(),
    wallMs: 0,
    attempts: 0,
    sampling: 0,
  }))
  for (const row of view.rows) {
    const slot = acc[bucketIndex(starts, view.bucketMs, row.bucket)]
    if (slot === undefined) continue
    if (row.sampling) {
      slot.sampling += row.attempts
      continue
    }
    const failed = row.outcome === 'failed'
    addCount(
      slot.segments,
      failed ? 'failed' : providerSeries(row.provider),
      row.attempts,
    )
    if (failed) addCount(slot.errors, row.error ?? 'no code', row.attempts)
    slot.wallMs += row.wallMs
    slot.attempts += row.attempts
  }
  return acc.map((a, i) => toActivityColumn(a, starts[i] ?? 0, view.bucketMs))
}

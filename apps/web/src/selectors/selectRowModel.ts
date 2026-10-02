import { formatJobState } from '../formatters/formatJobState'
import { buildHeartbeat } from '../heartbeat/buildHeartbeat'
import { RANGE_SPECS } from '../heartbeat/rangeSpecs'
import { BUCKET_LABELS } from '../labels/bucketLabels'
import { SYSTEM_LABELS } from '../labels/systemLabels'
import type { HistoryRange } from '../types/HistoryRange'
import type { LaunchdHistory } from '../types/LaunchdHistory'
import type { LaunchdRow } from '../types/LaunchdRow'
import type { LaunchdRowModel } from '../types/LaunchdRowModel'

export const selectRowModel = (
  history: LaunchdHistory,
  row: LaunchdRow,
  range: HistoryRange,
): LaunchdRowModel => {
  const buckets = buildHeartbeat(history, row, range, history.now)
  const counts = (['failed', 'missed', 'unknown'] as const)
    .map(
      (state) =>
        [state, buckets.filter((b) => b.state === state).length] as const,
    )
    .filter(([, n]) => n > 0)
    .map(([state, n]) => `${String(n)} ${BUCKET_LABELS[state]}`)
  const verdict =
    counts.length === 0 ? SYSTEM_LABELS.allHealthy : counts.join(', ')
  return {
    buckets,
    state: formatJobState(history.observations.at(-1) ?? null),
    summary: `${row.label}, last ${RANGE_SPECS[range].label}: ${verdict}`,
  }
}

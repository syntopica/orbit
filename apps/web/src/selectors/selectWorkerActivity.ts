import type { WorkerActivity } from '@orbit/contract'

import { ACTIVITY_SERIES_ORDER } from '../charts/activitySeriesOrder'
import type { WorkerActivityModel } from '../types/WorkerActivityModel'
import { bucketStarts } from './bucketStarts'
import { selectActivityColumns } from './selectActivityColumns'
import { selectFailureColumns } from './selectFailureColumns'
import { selectOpenrouterToday } from './selectOpenrouterToday'
import { selectQueueActivity } from './selectQueueActivity'

export const selectWorkerActivity = (
  view: WorkerActivity,
): WorkerActivityModel => {
  const starts = bucketStarts(view)
  const columns = selectActivityColumns(view, starts)
  const present = new Set(columns.flatMap((c) => c.segments.map((s) => s.key)))
  return {
    starts,
    bucketMs: view.bucketMs,
    columns,
    series: ACTIVITY_SERIES_ORDER.filter((key) => present.has(key)),
    queues: selectQueueActivity(view, starts),
    failures: selectFailureColumns(view, starts),
    openrouter: selectOpenrouterToday(view, starts),
  }
}

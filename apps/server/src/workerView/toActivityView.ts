import type { WorkerActivity } from '@orbit/contract'

import type { WorkerActivityReport } from '../types/WorkerActivityReport'
import { toActivityRows } from './toActivityRows'

export const toActivityView = (
  report: WorkerActivityReport,
  now: number,
): WorkerActivity => ({
  now,
  since: Math.round(report.since * 1000),
  bucketMs: Math.round(report.bucket_s * 1000),
  rows: toActivityRows(report.rows),
})

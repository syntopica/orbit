import type { WorkerCosts } from '@orbit/contract'

import type { WorkerCostsReport } from '../types/WorkerCostsReport'
import { toCostRows } from './toCostRows'

export const toCostsView = (
  report: WorkerCostsReport,
  now: number,
): WorkerCosts => ({
  now,
  rows: toCostRows(report.rows),
})

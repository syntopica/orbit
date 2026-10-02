import type { LaunchdHistory } from '../types/LaunchdHistory'
import { COVERAGE_SLACK_MS } from './coverageSlackMs'

export const isCovered = (
  runs: LaunchdHistory['runs'],
  start: number,
  end: number,
): boolean => {
  let reached = start
  for (const run of [...runs].sort((a, b) => a.started - b.started)) {
    if (run.started > reached) return false
    reached = Math.max(reached, run.stopped + COVERAGE_SLACK_MS)
    if (reached >= end) return true
  }
  return false
}

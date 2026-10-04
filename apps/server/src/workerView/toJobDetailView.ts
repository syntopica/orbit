import type { WorkerJobDetail } from '@orbit/contract'

import type { WorkerJobDetailReport } from '../types/WorkerJobDetailReport'
import { toAttemptView } from './toAttemptView'
import { toJobView } from './toJobView'

export const toJobDetailView = (
  row: WorkerJobDetailReport,
): WorkerJobDetail | null => {
  const job = toJobView(row)
  if (job === null) return null
  return {
    ...job,
    attemptDetails: row.attempt_details
      .map(toAttemptView)
      .filter((attempt) => attempt !== null),
    hasInput: row.has_input,
    hasOutput: row.has_output,
  }
}

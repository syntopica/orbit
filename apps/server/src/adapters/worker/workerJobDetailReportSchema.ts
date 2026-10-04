import { z } from 'zod'

import { workerAttemptReportSchema } from './workerAttemptReportSchema'
import { workerJobReportSchema } from './workerJobReportSchema'
import { workerResultReportSchema } from './workerResultReportSchema'

export const workerJobDetailReportSchema = workerJobReportSchema.extend({
  attempt_details: z.array(workerAttemptReportSchema).max(1000),
  // An older worker sends no result metadata.
  results: z.array(workerResultReportSchema).max(1000).default([]),
  has_input: z.boolean(),
  has_output: z.boolean(),
})

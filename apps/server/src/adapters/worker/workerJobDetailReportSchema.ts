import { z } from 'zod'

import { workerAttemptReportSchema } from './workerAttemptReportSchema'
import { workerJobReportSchema } from './workerJobReportSchema'

export const workerJobDetailReportSchema = workerJobReportSchema.extend({
  attempt_details: z.array(workerAttemptReportSchema).max(1000),
  has_input: z.boolean(),
  has_output: z.boolean(),
})

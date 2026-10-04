import { z } from 'zod'

import { workerAttemptSchema } from './workerAttemptSchema'
import { workerJobSchema } from './workerJobSchema'
import { workerResultSchema } from './workerResultSchema'

export const workerJobDetailSchema = workerJobSchema.extend({
  attemptDetails: z.array(workerAttemptSchema).max(1000),
  // Absent from an older server: no result metadata to show.
  results: z.array(workerResultSchema).max(1000).default([]),
  hasInput: z.boolean(),
  hasOutput: z.boolean(),
})

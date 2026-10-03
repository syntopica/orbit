import { z } from 'zod'

import { workerActivityRowSchema } from './workerActivityRowSchema'

// GET /api/worker/activity: epoch milliseconds and millisecond durations only.
export const workerActivitySchema = z.object({
  now: z.number(),
  since: z.number(),
  bucketMs: z.number().positive(),
  rows: z.array(workerActivityRowSchema).max(10_000),
})

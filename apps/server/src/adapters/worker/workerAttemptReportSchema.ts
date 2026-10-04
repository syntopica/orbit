import { z } from 'zod'

import { numberOrNullReportSchema } from './numberOrNullReportSchema'

export const workerAttemptReportSchema = z.object({
  node: z.string().nullable(),
  provider: z.string().nullable(),
  model: z.string().nullable(),
  outcome: z.string().nullable(),
  error: z.string().nullable(),
  started: z.number(),
  ended: z.number().nullable(),
  // Null until the attempt completes.
  tokens_in: z.number().int().nonnegative().nullable(),
  tokens_out: z.number().int().nonnegative().nullable(),
  wall_s: numberOrNullReportSchema,
  cost_usd: numberOrNullReportSchema,
})

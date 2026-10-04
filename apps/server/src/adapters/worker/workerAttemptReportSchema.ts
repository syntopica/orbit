import { z } from 'zod'

export const workerAttemptReportSchema = z.object({
  node: z.string().nullable(),
  provider: z.string().nullable(),
  model: z.string().nullable(),
  outcome: z.string().nullable(),
  error: z.string().nullable(),
  started: z.number(),
  ended: z.number().nullable(),
  tokens_in: z.number().int().nonnegative(),
  tokens_out: z.number().int().nonnegative(),
})

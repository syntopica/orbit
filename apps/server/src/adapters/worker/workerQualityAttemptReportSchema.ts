import { z } from 'zod'

export const workerQualityAttemptReportSchema = z.object({
  queue: z.string(),
  tier: z.string().nullable(),
  provider: z.string(),
  model: z.string(),
  attempts: z.number().int().nonnegative(),
  succeeded: z.number().int().nonnegative(),
  schema_violations: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  preempted: z.number().int().nonnegative(),
  mean_wall_s: z.number().nonnegative().nullable(),
})

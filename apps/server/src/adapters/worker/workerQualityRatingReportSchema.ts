import { z } from 'zod'

export const workerQualityRatingReportSchema = z.object({
  queue: z.string(),
  tier: z.string().nullable(),
  provider: z.string(),
  model: z.string(),
  results: z.number().int().nonnegative(),
  rated: z.number().int().nonnegative(),
  good: z.number().int().nonnegative(),
  edited: z.number().int().nonnegative(),
  discarded: z.number().int().nonnegative(),
})

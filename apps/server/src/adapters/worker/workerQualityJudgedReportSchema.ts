import { z } from 'zod'

export const workerQualityJudgedReportSchema = z.object({
  queue: z.string(),
  provider: z.string(),
  model: z.string(),
  judged: z.number().int().nonnegative(),
  mean_score: z.number().nullable(),
  best: z.number().int().nonnegative(),
})

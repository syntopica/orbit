import { z } from 'zod'

export const workerCostRowReportSchema = z.object({
  provider: z.string(),
  queue: z.string(),
  day: z.iso.date(),
  attempts: z.number().int().nonnegative(),
  succeeded: z.number().int().nonnegative(),
  tokens_in: z.number().int().nonnegative(),
  tokens_out: z.number().int().nonnegative(),
  cost_usd: z.number().nonnegative(),
  wall_s: z.number().nonnegative(),
})

import { z } from 'zod'

// GET /v1/activity as the coordinator answers it; names are checked later.
export const workerActivityReportSchema = z.object({
  since: z.number(),
  bucket_s: z.number().positive(),
  rows: z
    .array(
      z.object({
        bucket: z.number(),
        queue: z.string(),
        provider: z.string(),
        sampling: z.boolean(),
        outcome: z.string(),
        error: z.string().nullable(),
        attempts: z.number().int().nonnegative(),
        wall_s: z.number(),
        tokens_in: z.number().int().nonnegative(),
        tokens_out: z.number().int().nonnegative(),
      }),
    )
    .max(10_000),
})

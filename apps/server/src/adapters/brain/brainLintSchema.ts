import { z } from 'zod'

export const brainLintSchema = z.object({
  schemaVersion: z.literal(1),
  pageCount: z.number().int().nonnegative(),
  indexStale: z.boolean(),
  issues: z.array(z.object({ page: z.string(), code: z.string() })),
})

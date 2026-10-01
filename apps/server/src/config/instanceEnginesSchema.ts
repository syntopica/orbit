import { z } from 'zod'

export const instanceEnginesSchema = z.object({
  engines: z
    .record(z.string(), z.object({ path: z.string().min(1) }))
    .default({}),
})

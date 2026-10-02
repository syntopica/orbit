import { z } from 'zod'

import { workerNodeReportSchema } from './workerNodeReportSchema'

export const workerStatusSchema = z.object({
  queues: z.record(
    z.string(),
    z.object({
      states: z.record(z.string(), z.number().int().nonnegative()),
      oldest_queued_s: z.number().nullable(),
      done_1h: z.number(),
      wasted_1h_s: z.number(),
    }),
  ),
  nodes: z.record(z.string(), workerNodeReportSchema),
  cooldowns: z.record(z.string(), z.number()),
  recent_failures: z.array(
    z.object({
      id: z.string(),
      queue: z.string(),
      error: z.string().nullable(),
      finished: z.number().nullable(),
    }),
  ),
})

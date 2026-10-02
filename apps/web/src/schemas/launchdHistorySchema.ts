import { z } from 'zod'

export const launchdHistorySchema = z.object({
  observations: z.array(
    z.object({
      label: z.string(),
      at: z.number(),
      pid: z.number().nullable(),
      runs: z.number().nullable(),
      lastExit: z.number().nullable(),
    }),
  ),
  runs: z.array(z.object({ started: z.number(), stopped: z.number() })),
})

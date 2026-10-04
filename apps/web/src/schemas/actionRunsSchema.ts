import { z } from 'zod'

export const actionRunsSchema = z.object({
  runs: z.array(
    z.object({
      id: z.string(),
      kind: z.string(),
      target: z.string(),
      state: z.enum(['started', 'succeeded', 'failed']),
      startedAt: z.number(),
      exitCode: z.number(),
      durationMs: z.number(),
    }),
  ),
})

import { z } from 'zod'

export const clipsStatusSchema = z.object({
  schemaVersion: z.literal(1),
  total: z.number().int().nonnegative(),
  states: z.record(z.string(), z.number().int().nonnegative()),
  oldestAt: z.record(z.string(), z.iso.datetime().nullable()),
  intake: z.object({
    days: z.array(
      z.object({ day: z.string(), count: z.number().int().nonnegative() }),
    ),
    undated: z.number().int().nonnegative(),
  }),
})

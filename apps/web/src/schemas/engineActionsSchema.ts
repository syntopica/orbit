import { z } from 'zod'

export const engineActionsSchema = z.object({
  actions: z.record(
    z.string(),
    z.object({
      args: z.array(z.string()),
      label: z.string(),
      timeoutS: z.number(),
    }),
  ),
})

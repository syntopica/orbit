import { z } from 'zod'

export const serveStatusSchema = z.object({
  Web: z
    .record(
      z.string(),
      z.object({
        Handlers: z.record(
          z.string(),
          z.object({ Proxy: z.string().optional() }),
        ),
      }),
    )
    .optional(),
  AllowFunnel: z.record(z.string(), z.boolean()).optional(),
})

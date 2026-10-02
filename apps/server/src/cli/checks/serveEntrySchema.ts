import { z } from 'zod'

export const serveEntrySchema = z.object({
  Handlers: z.record(z.string(), z.object({ Proxy: z.string().optional() })),
})

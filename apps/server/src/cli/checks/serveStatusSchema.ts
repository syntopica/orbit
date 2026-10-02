import { z } from 'zod'

// Entries are validated one by one, so one malformed host never hides the rest.
export const serveStatusSchema = z.object({
  Web: z.record(z.string(), z.unknown()).optional(),
  AllowFunnel: z.record(z.string(), z.unknown()).optional(),
})

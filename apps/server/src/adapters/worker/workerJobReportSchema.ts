import { z } from 'zod'

export const workerJobReportSchema = z.object({
  id: z.string(),
  queue: z.string(),
  producer: z.string(),
  state: z.string(),
  privacy: z.enum(['public', 'internal', 'personal', 'mail', 'secret']),
  tier: z.string(),
  created: z.number(),
  updated: z.number(),
  attempts: z.number().int().nonnegative(),
  last_error: z.string().nullable(),
  acked: z.number().nullable(),
  retry_of: z.string().nullable(),
  sampling: z.boolean(),
})

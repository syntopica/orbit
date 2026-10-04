import { z } from 'zod'

import { numberOrNullReportSchema } from './numberOrNullReportSchema'
import { textOrNullReportSchema } from './textOrNullReportSchema'

// Fields below `sampling` arrived with the worker's job metrics; an older
// worker omits them and they read as null.
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
  kind: textOrNullReportSchema,
  model: textOrNullReportSchema,
  priority: numberOrNullReportSchema,
  finished: numberOrNullReportSchema,
  deadline: numberOrNullReportSchema,
  lease_node: textOrNullReportSchema,
  lease_expires: numberOrNullReportSchema,
  parent_id: textOrNullReportSchema,
  preemptions: numberOrNullReportSchema,
  tokens_in: numberOrNullReportSchema,
  tokens_out: numberOrNullReportSchema,
  cost_usd: numberOrNullReportSchema,
  wall_s: numberOrNullReportSchema,
  last_model: textOrNullReportSchema,
  last_provider: textOrNullReportSchema,
  last_started: numberOrNullReportSchema,
  last_outcome: textOrNullReportSchema,
})

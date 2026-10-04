import { z } from 'zod'

import { COMPONENT_IDS } from '../componentIds'

// How orbit's own poll loop for one component is doing; no content, only
// times, a duration and a failure count.
export const pollerRowSchema = z.object({
  component: z.enum(COMPONENT_IDS),
  running: z.boolean(),
  lastAttemptAt: z.number().nullable(),
  lastSuccessAt: z.number().nullable(),
  lastDurationMs: z.number().nullable(),
  failures: z.number().int().nonnegative(),
  nextAt: z.number().nullable(),
})

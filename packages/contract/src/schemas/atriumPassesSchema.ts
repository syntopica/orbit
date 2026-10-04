import { z } from 'zod'

import { atriumPassSchema } from './atriumPassSchema'
import { countSchema } from './countSchema'

// GET /api/atrium/passes: recent passes newest first, how many in a row
// ended without succeeding, and the running pass's progress (counts only).
export const atriumPassesSchema = z.object({
  now: z.number(),
  lastPass: atriumPassSchema.nullable(),
  unsuccessfulStreak: countSchema,
  progress: z
    .object({
      conversations: countSchema,
      finished: countSchema,
      failed: countSchema,
      synthesized: countSchema,
      walled: z.boolean(),
      updatedAt: z.number().nullable(),
    })
    .nullable(),
  passes: z.array(atriumPassSchema),
})

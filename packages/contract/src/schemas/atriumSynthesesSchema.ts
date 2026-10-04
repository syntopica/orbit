import { z } from 'zod'

import { atriumSynthesisRowSchema } from './atriumSynthesisRowSchema'
import { countSchema } from './countSchema'

// GET /api/atrium/syntheses: the newest records and records and tokens per
// UTC day (`day` is that day's midnight, epoch ms), oldest day first.
export const atriumSynthesesSchema = z.object({
  now: z.number(),
  records: countSchema,
  rows: z.array(atriumSynthesisRowSchema),
  daily: z.array(
    z.object({
      day: z.number(),
      records: countSchema,
      inputTokens: countSchema,
      outputTokens: countSchema,
    }),
  ),
})

import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

// One bucket of finished attempts: aggregates only, never a job id or content.
export const workerActivityRowSchema = z.object({
  bucket: z.number(),
  queue: identifierSchema,
  provider: identifierSchema,
  sampling: z.boolean(),
  outcome: identifierSchema,
  error: identifierSchema.nullable(),
  attempts: countSchema,
  wallMs: z.number().nonnegative(),
  tokensIn: countSchema,
  tokensOut: countSchema,
})

import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

export const workerQualityAttemptSchema = z.object({
  queue: identifierSchema,
  tier: identifierSchema.nullable(),
  provider: identifierSchema,
  model: identifierSchema,
  attempts: countSchema,
  succeeded: countSchema,
  schemaViolations: countSchema,
  failed: countSchema,
  preempted: countSchema,
  meanWallMs: z.number().nonnegative().nullable(),
})

import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

export const workerQualityRatingSchema = z.object({
  queue: identifierSchema,
  tier: identifierSchema.nullable(),
  provider: identifierSchema,
  model: identifierSchema,
  results: countSchema,
  rated: countSchema,
  good: countSchema,
  edited: countSchema,
  discarded: countSchema,
})

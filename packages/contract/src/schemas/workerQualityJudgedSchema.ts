import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

export const workerQualityJudgedSchema = z.object({
  queue: identifierSchema,
  provider: identifierSchema,
  model: identifierSchema,
  judged: countSchema,
  meanScore: z.number().nullable(),
  best: countSchema,
})

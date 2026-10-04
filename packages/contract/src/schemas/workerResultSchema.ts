import { z } from 'zod'

import { amountOrNullSchema } from './amountOrNullSchema'
import { countOrNullSchema } from './countOrNullSchema'
import { identifierSchema } from './identifierSchema'

// One stored result's metadata: what settled the job, who answered and what
// it spent. Never the output body, which stays behind the content route.
export const workerResultSchema = z.object({
  resultId: identifierSchema,
  control: identifierSchema.nullable(),
  error: identifierSchema.nullable(),
  schemaPath: identifierSchema.nullable(),
  node: identifierSchema.nullable(),
  provider: identifierSchema.nullable(),
  model: identifierSchema.nullable(),
  tokensIn: countOrNullSchema,
  tokensOut: countOrNullSchema,
  costUsd: amountOrNullSchema,
  rating: identifierSchema.nullable(),
  createdAt: z.number(),
  ackedAt: z.number().nullable(),
})

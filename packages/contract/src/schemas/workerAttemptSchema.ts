import { z } from 'zod'

import { identifierSchema } from './identifierSchema'

export const workerAttemptSchema = z.object({
  node: identifierSchema.nullable(),
  provider: identifierSchema.nullable(),
  model: identifierSchema.nullable(),
  outcome: identifierSchema.nullable(),
  error: identifierSchema.nullable(),
  startedAt: z.number(),
  endedAt: z.number().nullable(),
  tokensIn: z.number().int().nonnegative().nullable(),
  tokensOut: z.number().int().nonnegative().nullable(),
})

import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

export const workerCostRowSchema = z.object({
  day: z.number(),
  provider: identifierSchema,
  queue: identifierSchema,
  attempts: countSchema,
  succeeded: countSchema,
  wallMs: z.number().nonnegative(),
  tokensIn: countSchema,
  tokensOut: countSchema,
  costUsd: z.number().nonnegative(),
})

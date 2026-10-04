import { z } from 'zod'

import { identifierSchema } from './identifierSchema'

export const workerJobSchema = z.object({
  id: identifierSchema,
  queue: identifierSchema,
  producer: identifierSchema,
  state: identifierSchema,
  privacy: z.enum(['public', 'internal', 'personal', 'mail', 'secret']),
  tier: identifierSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  attempts: z.number().int().nonnegative(),
  lastError: identifierSchema.nullable(),
  acked: z.number().nullable(),
  retryOf: identifierSchema.nullable(),
  sampling: z.boolean(),
})

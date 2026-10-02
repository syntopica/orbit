import { z } from 'zod'

import { identifierSchema } from './identifierSchema'

export const workerFailureSchema = z.object({
  id: identifierSchema,
  queue: identifierSchema,
  error: identifierSchema.nullable(),
  finishedAt: z.number().nullable(),
})

import { z } from 'zod'

import { identifierSchema } from './identifierSchema'

export const workerJobActionSchema = z.object({
  id: identifierSchema,
  state: identifierSchema,
  retryOf: identifierSchema.optional(),
})

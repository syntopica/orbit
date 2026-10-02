import { z } from 'zod'

import { identifierSchema } from './identifierSchema'

export const workerCooldownSchema = z.object({
  runner: identifierSchema,
  availableAt: z.number(),
})

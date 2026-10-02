import { z } from 'zod'

import { identifierSchema } from './identifierSchema'

export const workerNodeSchema = z.object({
  name: identifierSchema,
  reason: identifierSchema.nullable(),
  idleMs: z.number().nonnegative().nullable(),
  onAc: z.boolean().nullable(),
  pressure: identifierSchema.nullable(),
  resident: z.array(identifierSchema),
  reportAgeMs: z.number().nonnegative(),
  lastRelease: z
    .object({
      code: identifierSchema.nullable(),
      ageMs: z.number().nonnegative(),
    })
    .nullable(),
})

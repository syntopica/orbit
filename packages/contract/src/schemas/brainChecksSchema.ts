import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'
import { pageIdSchema } from './pageIdSchema'

export const brainChecksSchema = z.object({
  now: z.number(),
  pageCount: countSchema,
  indexStale: z.boolean(),
  issues: z
    .array(z.object({ page: pageIdSchema, code: identifierSchema }))
    .max(500),
  doctor: z.object({
    ok: z.boolean(),
    checks: z.array(
      z.object({
        name: identifierSchema,
        ok: z.boolean(),
        code: identifierSchema,
      }),
    ),
  }),
})

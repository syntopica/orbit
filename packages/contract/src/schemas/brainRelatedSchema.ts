import { z } from 'zod'

import { countSchema } from './countSchema'
import { pageIdSchema } from './pageIdSchema'

export const brainRelatedSchema = z.object({
  now: z.number(),
  total: countSchema,
  pairs: z.array(
    z.object({
      left: pageIdSchema,
      right: pageIdSchema,
      score: z.number().nonnegative(),
    }),
  ),
})

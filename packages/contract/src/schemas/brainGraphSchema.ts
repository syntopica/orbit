import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'
import { pageIdSchema } from './pageIdSchema'

// GET /api/brain/graph (spec 7.5). Page ids are content: detail route only.
export const brainGraphSchema = z.object({
  now: z.number(),
  nodes: z.array(
    z.object({
      id: pageIdSchema,
      type: identifierSchema.nullable(),
      degree: countSchema,
      orphan: z.boolean(),
    }),
  ),
  edges: z.array(z.tuple([countSchema, countSchema])),
  dangling: countSchema,
  skipped: countSchema,
})

import { z } from 'zod'

import { identifierSchema } from './identifierSchema'
import { pageIdSchema } from './pageIdSchema'

// One page (spec 7.5, D1): a fixed set of frontmatter fields, never the rest.
export const brainPageSchema = z.object({
  id: pageIdSchema,
  title: z.string().max(512).nullable(),
  type: identifierSchema.nullable(),
  updated: z.string().max(64).nullable(),
  summary: z.string().max(2048).nullable(),
  sources: z.array(z.string().max(1024)).max(200),
  body: z.string(),
  truncated: z.boolean(),
  outbound: z.array(z.object({ target: pageIdSchema, exists: z.boolean() })),
  inbound: z.array(pageIdSchema),
})

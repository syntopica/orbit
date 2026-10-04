import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

// POST /api/atrium/context: what a session would receive, as labelled blocks
// (spec 7.4). Block text is content: it lives in this response only.
export const atriumContextSchema = z.object({
  now: z.number(),
  blocks: z.array(
    z.object({
      rank: z.number().int().positive(),
      trust: z.enum(['history', 'curated']),
      role: identifierSchema.nullable(),
      provider: identifierSchema.nullable(),
      notePath: z.string().max(512).nullable(),
      conversationId: identifierSchema.nullable(),
      authoredAt: z.number().nullable(),
      chars: countSchema,
      text: z.string(),
      truncated: z.boolean(),
    }),
  ),
  textChars: countSchema,
  limit: countSchema,
  maxChars: countSchema,
  warnings: z.array(identifierSchema),
  freshnessStatus: identifierSchema.nullable(),
})

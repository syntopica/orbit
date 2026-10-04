import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'
import { synthesisJobKeySchema } from './synthesisJobKeySchema'

// One synthesis record as identities, recipe, cost and counts; its title,
// summary, facts and open ends are content and never appear here (spec 6.6).
export const atriumSynthesisRowSchema = z.object({
  jobKey: synthesisJobKeySchema,
  kind: z.enum(['episode', 'session']),
  source: identifierSchema.nullable(),
  conversationId: identifierSchema.nullable(),
  episodeId: identifierSchema.nullable(),
  eventCount: countSchema,
  sessionSince: z.number().nullable(),
  sessionUntil: z.number().nullable(),
  authoredAt: z.number().nullable(),
  writtenAt: z.number(),
  modelRequested: identifierSchema.nullable(),
  modelResolved: identifierSchema.nullable(),
  inputTokens: countSchema,
  outputTokens: countSchema,
  durationMs: countSchema.nullable(),
  mapChunks: countSchema.nullable(),
  workerResults: countSchema,
  facts: countSchema,
  openEnds: countSchema,
})

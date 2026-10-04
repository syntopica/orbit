import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

// A clip's last synthesis run: transport identity, worker job ids and token
// counts, never the prompt or the answer. Usage is null when the transport
// reported none (worker jobs, older runs).
export const clipsRunSchema = z.object({
  startedAt: z.number(),
  durationMs: countSchema,
  outcome: z.enum(['synthesized', 'escalated', 'skipped']),
  model: identifierSchema,
  boundary: identifierSchema,
  workerJobIds: z.array(identifierSchema).max(20),
  usage: z
    .object({
      inputTokens: countSchema,
      outputTokens: countSchema,
      cachedInputTokens: countSchema.nullable(),
      reasoningTokens: countSchema.nullable(),
    })
    .nullable(),
})

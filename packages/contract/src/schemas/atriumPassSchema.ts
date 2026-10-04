import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

// One synthesis pass from atrium's tick log. Tallies are null when the pass
// printed none: a pass the time box stops (exit 124) never does.
export const atriumPassSchema = z.object({
  lane: identifierSchema.nullable(),
  producer: identifierSchema.nullable(),
  model: identifierSchema.nullable(),
  startedAt: z.number().nullable(),
  finishedAt: z.number().nullable(),
  durationMs: countSchema.nullable(),
  exitCode: z.number().int().nullable(),
  state: z.enum([
    'ok',
    'timeout',
    'killed',
    'failed',
    'interrupted',
    'running',
  ]),
  synthesized: countSchema.nullable(),
  skipped: countSchema.nullable(),
  failed: countSchema.nullable(),
  deferred: countSchema.nullable(),
})

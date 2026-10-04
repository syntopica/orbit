import { z } from 'zod'

import { clipsRunSchema } from './clipsRunSchema'
import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'
import { pageIdSchema } from './pageIdSchema'

// One clip of `clips status --json --items`: an opaque digest id (never the
// clip id), codes, times and counts. `pages` are the brain pages a published
// clip touched, as page ids: content by spec 6.6, so detail routes only.
export const clipsItemSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{16}$/),
  state: identifierSchema,
  reason: identifierSchema,
  failure: z
    .object({ stage: identifierSchema, code: identifierSchema })
    .nullable(),
  stage: z.enum([
    'capture',
    'synthesis',
    'publication',
    'reconciliation',
    'operator',
    'done',
  ]),
  capturedAt: z.number().nullable(),
  lastTransitionAt: z.number().nullable(),
  attempts: countSchema,
  lastRun: clipsRunSchema.nullable(),
  pages: z.array(pageIdSchema).max(50),
})

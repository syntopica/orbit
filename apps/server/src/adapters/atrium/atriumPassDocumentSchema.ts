import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'

// One pass as `atrium synthesis passes --json` prints it. Names are checked
// as identifiers when the view is built, not here.
export const atriumPassDocumentSchema = z.object({
  lane: z.string().nullish(),
  producer: z.string().nullish(),
  model: z.string().nullish(),
  startedAt: z.iso.datetime({ offset: true }).nullable(),
  finishedAt: z.iso.datetime({ offset: true }).nullable(),
  durationS: nonNegativeCount.nullable(),
  exitCode: z.number().int().nullable(),
  state: z.enum([
    'ok',
    'timeout',
    'killed',
    'failed',
    'interrupted',
    'running',
  ]),
  synthesized: nonNegativeCount.nullable(),
  skipped: nonNegativeCount.nullable(),
  failed: nonNegativeCount.nullable(),
  deferred: nonNegativeCount.nullable(),
})

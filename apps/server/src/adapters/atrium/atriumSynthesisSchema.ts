import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'

export const atriumSynthesisSchema = z.object({
  schemaVersion: z.literal(1),
  writtenAt: z.iso.datetime({ offset: true }),
  lastPass: z.object({
    producer: z.string(),
    startedAt: z.iso.datetime({ offset: true }),
    finishedAt: z.iso.datetime({ offset: true }),
    conversations: nonNegativeCount,
    synthesized: nonNegativeCount,
    skipped: nonNegativeCount,
    failed: nonNegativeCount,
    deferred: nonNegativeCount,
  }),
})

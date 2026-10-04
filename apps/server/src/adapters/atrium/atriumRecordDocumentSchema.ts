import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'

// One record's metadata as atrium prints it; no title, summary or facts.
export const atriumRecordDocumentSchema = z.object({
  jobKey: z.string(),
  kind: z.enum(['episode', 'session']),
  source: z.string().nullish(),
  conversationId: z.string().nullish(),
  episodeId: z.string().nullish(),
  eventCount: nonNegativeCount,
  session: z
    .object({
      since: z.string().nullish(),
      until: z.string().nullish(),
    })
    .nullish(),
  authoredAt: z.string().nullish(),
  writtenAt: z.iso.datetime({ offset: true }),
  modelRequested: z.string().nullish(),
  modelResolved: z.string().nullish(),
  inputTokens: nonNegativeCount,
  outputTokens: nonNegativeCount,
  durationMs: nonNegativeCount.nullable(),
  mapChunks: nonNegativeCount.nullish(),
  workerResults: nonNegativeCount,
  facts: nonNegativeCount,
  openEnds: nonNegativeCount,
})

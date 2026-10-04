import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'
import { atriumRecordDocumentSchema } from './atriumRecordDocumentSchema'

// `atrium synthesis recent --json`: the newest records and spend per UTC
// day. Its pass fields repeat `synthesis passes` and are not read here.
export const atriumRecentDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  records: nonNegativeCount,
  recent: z.array(atriumRecordDocumentSchema),
  daily: z.array(
    z.object({
      day: z.iso.date(),
      records: nonNegativeCount,
      inputTokens: nonNegativeCount,
      outputTokens: nonNegativeCount,
    }),
  ),
})

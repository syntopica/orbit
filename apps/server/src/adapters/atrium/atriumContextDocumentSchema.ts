import { atriumTrustSchema } from '@orbit/contract'
import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'

// `atrium context --json --lane words`, the fields orbit forwards; scores,
// record ids, routes and steps are stripped, never rejected.
export const atriumContextDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  evidence: z.array(
    z.object({
      text: z.string(),
      trust: atriumTrustSchema,
      role: z.string().nullish(),
      provider: z.string().nullish(),
      conversation_id: z.string().nullish(),
      note_path: z.string().nullish(),
      authored_at: z.string().nullish(),
      truncated: z.boolean().default(false),
    }),
  ),
  freshness: z.object({ status: z.string().nullish() }).nullish(),
  warnings: z.array(z.string()).default([]),
  limit: nonNegativeCount,
  max_chars: nonNegativeCount,
  text_chars: nonNegativeCount,
})

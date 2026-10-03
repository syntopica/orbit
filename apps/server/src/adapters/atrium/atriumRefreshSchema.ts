import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'
import { atriumInstantSchema } from './atriumInstantSchema'

// refresh.json as atrium documents it: counts, provider and model names,
// instants. Unknown fields are stripped, never rejected.
export const atriumRefreshSchema = z.object({
  schemaVersion: z.literal(1),
  writtenAt: z.iso.datetime({ offset: true }),
  records: z.object({
    total: nonNegativeCount,
    bySource: z.record(z.string(), nonNegativeCount),
  }),
  archive: atriumInstantSchema,
  refresh: atriumInstantSchema,
  content: atriumInstantSchema,
  populations: z.array(
    z.object({
      model: z.string(),
      intended: nonNegativeCount,
      indexed: nonNegativeCount,
    }),
  ),
})

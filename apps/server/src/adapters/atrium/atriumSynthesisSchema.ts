import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'

export const atriumSynthesisSchema = z.object({
  schemaVersion: z.literal(1),
  writtenAt: z.iso.datetime({ offset: true }),
  lastPass: z.object({ deferred: nonNegativeCount, failed: nonNegativeCount }),
})

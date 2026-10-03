import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'

export const captureCountSchema = z.object({
  data: z.object({
    schemaVersion: z.literal(1),
    count: nonNegativeCount,
    oldestAt: z.string().nullable(),
  }),
})

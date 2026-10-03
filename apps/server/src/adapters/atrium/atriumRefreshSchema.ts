import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'

export const atriumRefreshSchema = z.object({
  schemaVersion: z.literal(1),
  writtenAt: z.iso.datetime({ offset: true }),
  records: z.object({ total: nonNegativeCount }),
  populations: z.array(
    z.object({ intended: nonNegativeCount, indexed: nonNegativeCount }),
  ),
})

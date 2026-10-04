import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'

// The running pass's counts; atrium never prints its failure text here.
export const atriumProgressDocumentSchema = z.object({
  conversations: nonNegativeCount,
  finished: nonNegativeCount,
  failed: nonNegativeCount,
  synthesized: nonNegativeCount,
  walled: z.boolean(),
  updatedAt: z.iso.datetime({ offset: true }).nullable(),
})

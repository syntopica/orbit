import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'
import { atriumPassDocumentSchema } from './atriumPassDocumentSchema'
import { atriumProgressDocumentSchema } from './atriumProgressDocumentSchema'

// `atrium synthesis passes --json`: passes newest first, from the tick log
// that records the exit of a pass the time box killed.
export const atriumPassesDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  lastPass: atriumPassDocumentSchema.nullable(),
  unsuccessfulStreak: nonNegativeCount,
  progress: atriumProgressDocumentSchema.nullable(),
  passes: z.array(atriumPassDocumentSchema),
})

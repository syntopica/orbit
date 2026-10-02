import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

export const workerQueueSchema = z.object({
  name: identifierSchema,
  queued: countSchema,
  live: countSchema,
  failed: countSchema,
  succeeded: countSchema,
  oldestQueuedMs: z.number().nonnegative().nullable(),
  done1h: countSchema,
})

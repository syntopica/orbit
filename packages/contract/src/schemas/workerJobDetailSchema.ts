import { z } from 'zod'

import { workerAttemptSchema } from './workerAttemptSchema'
import { workerJobSchema } from './workerJobSchema'

export const workerJobDetailSchema = workerJobSchema.extend({
  attemptDetails: z.array(workerAttemptSchema).max(1000),
  hasInput: z.boolean(),
  hasOutput: z.boolean(),
})

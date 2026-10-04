import { z } from 'zod'

import { workerJobSchema } from './workerJobSchema'

export const workerJobListSchema = z.object({
  jobs: z.array(workerJobSchema).max(100),
  next: z.string().nullable(),
})

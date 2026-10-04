import { z } from 'zod'

import { workerJobReportSchema } from './workerJobReportSchema'

export const workerJobListReportSchema = z.object({
  jobs: z.array(workerJobReportSchema).max(100),
  next: z.string().nullable(),
})

import { z } from 'zod'

export const workerJobActionReportSchema = z.object({
  id: z.string(),
  state: z.string(),
  retry_of: z.string().optional(),
})

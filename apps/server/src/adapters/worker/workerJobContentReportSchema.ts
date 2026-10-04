import { z } from 'zod'

export const workerJobContentReportSchema = z.object({
  input: z.unknown(),
  output: z.unknown(),
})

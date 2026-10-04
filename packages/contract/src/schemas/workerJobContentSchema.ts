import { z } from 'zod'

export const workerJobContentSchema = z.object({
  input: z.unknown(),
  output: z.unknown(),
})

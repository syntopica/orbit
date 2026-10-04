import { z } from 'zod'

import { workerCostRowSchema } from './workerCostRowSchema'

export const workerCostsSchema = z.object({
  now: z.number(),
  rows: z.array(workerCostRowSchema).max(10_000),
})

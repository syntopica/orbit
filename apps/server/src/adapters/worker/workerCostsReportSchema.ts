import { z } from 'zod'

import { workerCostRowReportSchema } from './workerCostRowReportSchema'

export const workerCostsReportSchema = z.object({
  rows: z.array(workerCostRowReportSchema).max(10_000),
})

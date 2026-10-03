import { z } from 'zod'

import { METRIC_KEYS } from '../metricKeys'

export const metricValueSchema = z.object({
  key: z.enum(METRIC_KEYS),
  value: z.number(),
})

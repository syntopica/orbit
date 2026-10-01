import { z } from 'zod'

import { METRIC_KEYS } from '../metricKeys'

export const metricSchema = z
  .object({ key: z.enum(METRIC_KEYS), value: z.number(), at: z.iso.datetime() })
  .strict()

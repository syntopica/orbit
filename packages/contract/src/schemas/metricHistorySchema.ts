import { z } from 'zod'

import { METRIC_KEYS } from '../metricKeys'

// GET /api/history/metrics: orbit's own samples, epoch milliseconds (spec 7.4).
export const metricHistorySchema = z.object({
  now: z.number(),
  from: z.number(),
  runs: z.array(z.object({ started: z.number(), stopped: z.number() })),
  series: z.array(
    z.object({
      key: z.enum(METRIC_KEYS),
      points: z.array(z.object({ at: z.number(), value: z.number() })),
    }),
  ),
})

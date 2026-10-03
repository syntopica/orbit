import type { z } from 'zod'

import type { metricHistorySchema } from '../schemas/metricHistorySchema'

export type MetricHistory = z.infer<typeof metricHistorySchema>

import type { z } from 'zod'

import type { metricSchema } from '../schemas/metricSchema'

export type Metric = z.infer<typeof metricSchema>

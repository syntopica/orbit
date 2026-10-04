import type { z } from 'zod'

import type { workerQualityReportSchema } from '../adapters/worker/workerQualityReportSchema'

export type WorkerQualityReport = z.infer<typeof workerQualityReportSchema>

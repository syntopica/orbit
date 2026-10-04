import type { z } from 'zod'

import type { workerCostsReportSchema } from '../adapters/worker/workerCostsReportSchema'

export type WorkerCostsReport = z.infer<typeof workerCostsReportSchema>

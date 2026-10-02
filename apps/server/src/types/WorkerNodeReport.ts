import type { z } from 'zod'

import type { workerNodeReportSchema } from '../adapters/worker/workerNodeReportSchema'

export type WorkerNodeReport = z.infer<typeof workerNodeReportSchema>

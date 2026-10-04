import type { z } from 'zod'

import type { workerJobDetailReportSchema } from '../adapters/worker/workerJobDetailReportSchema'

export type WorkerJobDetailReport = z.infer<typeof workerJobDetailReportSchema>

import type { z } from 'zod'

import type { workerJobReportSchema } from '../adapters/worker/workerJobReportSchema'

export type WorkerJobReport = z.infer<typeof workerJobReportSchema>

import type { z } from 'zod'

import type { workerActivityReportSchema } from '../adapters/worker/workerActivityReportSchema'

export type WorkerActivityReport = z.infer<typeof workerActivityReportSchema>

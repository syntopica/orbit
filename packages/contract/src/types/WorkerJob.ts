import type { z } from 'zod'

import type { workerJobSchema } from '../schemas/workerJobSchema'

export type WorkerJob = z.infer<typeof workerJobSchema>

import type { z } from 'zod'

import type { workerStatusSchema } from '../adapters/worker/workerStatusSchema'

export type WorkerStatus = z.infer<typeof workerStatusSchema>

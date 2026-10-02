import type { z } from 'zod'

import type { workerQueueSchema } from '../schemas/workerQueueSchema'

export type WorkerQueue = z.infer<typeof workerQueueSchema>

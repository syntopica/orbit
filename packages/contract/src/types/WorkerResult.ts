import type { z } from 'zod'

import type { workerResultSchema } from '../schemas/workerResultSchema'

export type WorkerResult = z.infer<typeof workerResultSchema>

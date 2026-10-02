import type { z } from 'zod'

import type { workerFailureSchema } from '../schemas/workerFailureSchema'

export type WorkerFailure = z.infer<typeof workerFailureSchema>

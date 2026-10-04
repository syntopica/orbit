import type { z } from 'zod'

import type { workerQualityAttemptSchema } from '../schemas/workerQualityAttemptSchema'

export type WorkerQualityAttempt = z.infer<typeof workerQualityAttemptSchema>

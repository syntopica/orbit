import type { z } from 'zod'

import type { workerQualitySchema } from '../schemas/workerQualitySchema'

export type WorkerQuality = z.infer<typeof workerQualitySchema>

import type { z } from 'zod'

import type { workerQualityJudgedSchema } from '../schemas/workerQualityJudgedSchema'

export type WorkerQualityJudged = z.infer<typeof workerQualityJudgedSchema>

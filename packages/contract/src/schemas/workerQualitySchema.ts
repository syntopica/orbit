import { z } from 'zod'

import { workerQualityAttemptSchema } from './workerQualityAttemptSchema'
import { workerQualityJudgedSchema } from './workerQualityJudgedSchema'
import { workerQualityRatingSchema } from './workerQualityRatingSchema'

export const workerQualitySchema = z.object({
  now: z.number(),
  attempts: z.array(workerQualityAttemptSchema).max(10_000),
  ratings: z.array(workerQualityRatingSchema).max(10_000),
  judged: z.array(workerQualityJudgedSchema).max(10_000),
})

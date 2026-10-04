import { z } from 'zod'

import { workerQualityAttemptReportSchema } from './workerQualityAttemptReportSchema'
import { workerQualityJudgedReportSchema } from './workerQualityJudgedReportSchema'
import { workerQualityRatingReportSchema } from './workerQualityRatingReportSchema'

export const workerQualityReportSchema = z.object({
  attempts: z.array(workerQualityAttemptReportSchema).max(10_000),
  ratings: z.array(workerQualityRatingReportSchema).max(10_000),
  judged: z.array(workerQualityJudgedReportSchema).max(10_000),
})

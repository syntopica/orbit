import { z } from 'zod'

// A worker field newer than the oldest supported worker: absent reads as null.
export const numberOrNullReportSchema = z.number().nullable().default(null)

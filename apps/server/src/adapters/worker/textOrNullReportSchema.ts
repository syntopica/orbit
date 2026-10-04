import { z } from 'zod'

// A worker field newer than the oldest supported worker: absent reads as null.
export const textOrNullReportSchema = z.string().nullable().default(null)

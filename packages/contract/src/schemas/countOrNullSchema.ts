import { z } from 'zod'

// A non-negative count added after the first worker release: absent reads as
// null, so an older server or worker still parses.
export const countOrNullSchema = z
  .number()
  .int()
  .nonnegative()
  .nullable()
  .default(null)

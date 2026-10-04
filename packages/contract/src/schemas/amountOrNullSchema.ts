import { z } from 'zod'

// A non-negative amount (epoch ms, a duration in ms or US dollars) added after
// the first worker release: absent reads as null, so an older sender parses.
export const amountOrNullSchema = z
  .number()
  .nonnegative()
  .nullable()
  .default(null)

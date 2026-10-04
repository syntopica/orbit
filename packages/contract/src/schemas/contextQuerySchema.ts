import { z } from 'zod'

// The one free argument orbit passes to an engine (spec 5.3): 1 to 500
// characters after trimming, no control characters. It always travels as a
// single argv element, never through a shell.
export const contextQuerySchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((query) => !/\p{Cc}/u.test(query))

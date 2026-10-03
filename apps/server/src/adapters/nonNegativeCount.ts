import { z } from 'zod'

export const nonNegativeCount = z.number().int().nonnegative()

import { z } from 'zod'

export const refValueSchema = z.union([
  z.number(),
  z
    .string()
    .max(64)
    .regex(/^[\w.:-]+$/),
])

import { z } from 'zod'

export const countSchema = z.number().int().nonnegative()

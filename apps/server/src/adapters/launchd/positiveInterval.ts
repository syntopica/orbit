import { z } from 'zod'

export const positiveInterval = (value: unknown): number | null => {
  const parsed = z.number().int().positive().safeParse(value)
  return parsed.success ? parsed.data : null
}

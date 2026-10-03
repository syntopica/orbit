import type { z } from 'zod'

import { ProcessError } from '../../process/ProcessError'

// A body that is not JSON, or not the expected shape, is one fixed code.
export const parseWorkerJson = <T>(text: string, schema: z.ZodType<T>): T => {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new ProcessError('schema_invalid')
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) throw new ProcessError('schema_invalid')
  return parsed.data
}

import type { z } from 'zod'

import { ProcessError } from '../process/ProcessError'
import type { RunResult } from '../types/RunResult'
import { schemaVersionSchema } from './schemaVersionSchema'

// A run is judged by its stdout: engines print their document even when they
// exit non-zero to report findings. Nothing from stdout reaches an error.
export const parseEngineDocument = <T>(
  result: RunResult,
  schema: z.ZodType<T>,
): T => {
  let json: unknown
  try {
    json = JSON.parse(result.stdout)
  } catch {
    throw new ProcessError(
      result.code === 0 ? 'schema_invalid' : 'exit_nonzero',
    )
  }
  const version = schemaVersionSchema.safeParse(json)
  if (version.success && version.data.schemaVersion !== 1)
    throw new ProcessError('engine_schema_unsupported')
  const parsed = schema.safeParse(json)
  if (parsed.success) return parsed.data
  throw new ProcessError(result.code === 0 ? 'schema_invalid' : 'exit_nonzero')
}

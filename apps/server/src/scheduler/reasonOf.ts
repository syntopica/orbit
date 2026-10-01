import type { ReasonCode } from '@orbit/contract'
import { ZodError } from 'zod'

import { ProcessError } from '../process/ProcessError'

export const reasonOf = (error: unknown): ReasonCode => {
  if (error instanceof ProcessError) return error.reason
  if (error instanceof ZodError) return 'schema_invalid'
  if (
    error instanceof DOMException &&
    (error.name === 'TimeoutError' || error.name === 'AbortError')
  ) {
    return 'timeout'
  }
  return 'unreachable'
}

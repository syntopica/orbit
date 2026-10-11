import type { RunRequest } from '../types/RunRequest'
import { ProcessError } from './ProcessError'

// The log word for a failed command. A run its caller abandoned (an adapter or
// pool budget running out first) reads `aborted`, so only a command that used
// up its own `timeoutMs` counts as `timeout`.
export const failureOutcome = (error: unknown, request: RunRequest): string => {
  if (!(error instanceof ProcessError)) return 'error'
  return error.reason === 'timeout' && request.signal?.aborted === true
    ? 'aborted'
    : error.reason
}

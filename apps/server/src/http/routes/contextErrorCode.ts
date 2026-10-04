import { ProcessError } from '../../process/ProcessError'

// A fixed code for the response; the error itself is dropped unlogged.
export const contextErrorCode = (
  error: unknown,
): 'engine_schema_unsupported' | 'unavailable' =>
  error instanceof ProcessError && error.reason === 'engine_schema_unsupported'
    ? 'engine_schema_unsupported'
    : 'unavailable'

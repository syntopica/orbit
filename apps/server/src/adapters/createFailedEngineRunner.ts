import { ProcessError } from '../process/ProcessError'
import type { EngineRunner } from '../types/EngineRunner'

// Stands in for an engine that did not resolve, so its adapter reads `down`.
export const createFailedEngineRunner: EngineRunner = async () => {
  await Promise.resolve()
  throw new ProcessError('not_found')
}

import { readAtriumContext } from '../adapters/atrium/readAtriumContext'
import { createFailedEngineRunner } from '../adapters/createFailedEngineRunner'
import type { AtriumContextReader } from '../types/AtriumContextReader'
import type { EngineRunner } from '../types/EngineRunner'

// Not cached: each query is content, asked for once and rate limited.
export const buildAtriumContextReader = (
  run: EngineRunner | undefined,
  configured: boolean,
): AtriumContextReader | null => {
  if (!configured) return null
  const runner = run ?? createFailedEngineRunner
  return async (query, signal) => readAtriumContext(runner, query, signal)
}

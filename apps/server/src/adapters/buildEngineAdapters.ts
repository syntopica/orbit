import type { Adapter } from '../types/Adapter'
import type { AdapterContext } from '../types/AdapterContext'
import { createBrainAdapter } from './brain/createBrainAdapter'
import { createClipsAdapter } from './clips/createClipsAdapter'
import { createFailedEngineRunner } from './createFailedEngineRunner'

// brain and clips run engine commands; an unresolved engine fails not_found.
export const buildEngineAdapters = (context: AdapterContext): Adapter[] => {
  const { config, engines } = context
  const adapters: Adapter[] = []
  if (config.engines.brain !== undefined) {
    adapters.push(
      createBrainAdapter({
        run: engines['brain'] ?? createFailedEngineRunner,
        cadenceMs: config.cadenceMs.brain ?? 60_000,
      }),
    )
  }
  if (config.engines.clips !== undefined) {
    adapters.push(
      createClipsAdapter({
        run: engines['clips'] ?? createFailedEngineRunner,
        cadenceMs: config.cadenceMs.clips ?? 60_000,
        oldestDays: config.warnings.clipsOldestDays,
      }),
    )
  }
  return adapters
}

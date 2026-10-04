import type { Adapter } from '../types/Adapter'
import type { AdapterContext } from '../types/AdapterContext'
import { createAtriumAdapter } from './atrium/createAtriumAdapter'
import { readAtriumPasses } from './atrium/readAtriumPasses'
import { buildEngineAdapters } from './buildEngineAdapters'
import { createCaptureAdapter } from './capture/createCaptureAdapter'

// atrium, brain, clips, capture, in that order (spec 3.1 cadences).
export const buildMemoryAdapters = (context: AdapterContext): Adapter[] => {
  const { config, engines } = context
  const adapters: Adapter[] = []
  if (config.atrium !== undefined) {
    const run = engines['atrium']
    adapters.push(
      createAtriumAdapter({
        ...config.atrium,
        cadenceMs: config.cadenceMs.atrium ?? 60_000,
        ...(run === undefined
          ? {}
          : { readPasses: async (signal) => readAtriumPasses(run, signal) }),
      }),
    )
  }
  adapters.push(...buildEngineAdapters(context))
  if (config.capture !== undefined) {
    adapters.push(
      createCaptureAdapter({
        ...config.capture,
        cadenceMs: config.cadenceMs.capture ?? 120_000,
        fetch: context.fetch,
      }),
    )
  }
  return adapters
}

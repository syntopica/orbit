import type { Adapter } from '../types/Adapter'
import type { AdapterContext } from '../types/AdapterContext'
import { createAtriumAdapter } from './atrium/createAtriumAdapter'
import { buildEngineAdapters } from './buildEngineAdapters'
import { createCaptureAdapter } from './capture/createCaptureAdapter'

// atrium, brain, clips, capture, in that order (spec 3.1 cadences).
export const buildMemoryAdapters = (context: AdapterContext): Adapter[] => {
  const { config } = context
  const adapters: Adapter[] = []
  if (config.atrium !== undefined) {
    adapters.push(
      createAtriumAdapter({
        ...config.atrium,
        cadenceMs: config.cadenceMs.atrium ?? 60_000,
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

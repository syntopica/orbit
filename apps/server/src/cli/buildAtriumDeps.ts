import type { AppDeps } from '../types/AppDeps'
import type { EngineRunner } from '../types/EngineRunner'
import type { OrbitConfig } from '../types/OrbitConfig'
import { buildAtriumContextReader } from './buildAtriumContextReader'
import { buildAtriumReader } from './buildAtriumReader'
import { buildAtriumSynthesisReaders } from './buildAtriumSynthesisReaders'

// Status files, the context inspector and the synthesis views; the last two
// run `engines.atrium`, the first never runs atrium.
export const buildAtriumDeps = (
  config: OrbitConfig,
  engines: Readonly<Record<string, EngineRunner>>,
): Pick<AppDeps, 'atrium' | 'atriumContext' | 'atriumSyntheses'> => {
  const cadenceMs = config.cadenceMs.atrium ?? 60_000
  const configured = config.engines.atrium !== undefined
  return {
    atrium: buildAtriumReader(config.atrium, cadenceMs),
    atriumContext: buildAtriumContextReader(engines['atrium'], configured),
    atriumSyntheses: buildAtriumSynthesisReaders(
      engines['atrium'],
      configured,
      cadenceMs,
    ),
  }
}

import { createLaunchdCatalog } from '../adapters/launchd/createLaunchdCatalog'
import { recordLaunchdObservation } from '../history/recordLaunchdObservation'
import { createApp } from '../http/createApp'
import { runProcess } from '../process/runProcess'
import type { BuildHandlerArgs } from '../types/BuildHandlerArgs'
import type { RequestHandler } from '../types/RequestHandler'
import { buildAtriumReader } from './buildAtriumReader'
import { buildBrainReaders } from './buildBrainReaders'
import { buildClipsReader } from './buildClipsReader'
import { buildStageLabels } from './buildStageLabels'
import { buildWorkerActivityReader } from './buildWorkerActivityReader'
import { buildWorkerCostsReader } from './buildWorkerCostsReader'
import { buildWorkerQualityReader } from './buildWorkerQualityReader'
import { buildWorkerReader } from './buildWorkerReader'

// The HTTP application over the state, for the port the server really got.
export const buildHandler = (
  ...[state, hub, webRoot, port, engines]: BuildHandlerArgs
): RequestHandler => {
  const { config, historyDb } = state
  const uid = process.getuid?.() ?? 0
  const launchd = config.launchd
  const catalog =
    launchd === undefined
      ? null
      : createLaunchdCatalog({
          ...launchd,
          uid,
          cadenceMs: config.cadenceMs.launchd ?? 10_000,
          run: runProcess,
          record: (observation) => {
            recordLaunchdObservation(historyDb, observation)
          },
        })
  const app = createApp({
    authDb: state.authDb,
    historyDb,
    hub,
    catalog,
    stageLabels: buildStageLabels(config.launchd?.labels ?? []),
    clips: buildClipsReader(
      engines['clips'],
      config.engines.clips !== undefined,
      config.cadenceMs.clips ?? 60_000,
    ),
    brain: buildBrainReaders(
      engines['brain'],
      config.engines.brain !== undefined,
      config.cadenceMs.brain ?? 60_000,
    ),
    atrium: buildAtriumReader(config.atrium, config.cadenceMs.atrium ?? 60_000),
    worker: buildWorkerReader(config.worker, fetch),
    workerActivity: buildWorkerActivityReader(config.worker, fetch),
    workerCosts: buildWorkerCostsReader(config.worker, fetch),
    workerQuality: buildWorkerQualityReader(config.worker, fetch),
    guard: {
      port,
      allowedHosts: config.allowedHosts,
      allowedLogins: config.allowedLogins,
    },
    webRoot,
    now: Date.now,
  })
  return async (request, env) => app.fetch(request, env)
}

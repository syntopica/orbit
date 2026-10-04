import { configuredTodoFiles } from '../config/configuredTodoFiles'
import { createApp } from '../http/createApp'
import type { BuildHandlerArgs } from '../types/BuildHandlerArgs'
import type { RequestHandler } from '../types/RequestHandler'
import { buildActionDeps } from './buildActionDeps'
import { buildAtriumDeps } from './buildAtriumDeps'
import { buildBrainReaders } from './buildBrainReaders'
import { buildClipsReader } from './buildClipsReader'
import { buildLaunchdCatalog } from './buildLaunchdCatalog'
import { buildStageLabels } from './buildStageLabels'
import { buildWorkerActivityReader } from './buildWorkerActivityReader'
import { buildWorkerCostsReader } from './buildWorkerCostsReader'
import { buildWorkerJobClient } from './buildWorkerJobClient'
import { buildWorkerQualityReader } from './buildWorkerQualityReader'
import { buildWorkerReader } from './buildWorkerReader'

// The HTTP application over the state, for the port the server really got.
export const buildHandler = (
  ...[state, hub, webRoot, port, engines, signal, poller]: BuildHandlerArgs
): RequestHandler => {
  const { config, historyDb } = state
  const catalog = buildLaunchdCatalog(state)
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
      state.clipsLatest,
    ),
    clipsLatest: () =>
      state.clipsLatest.get((config.cadenceMs.clips ?? 60_000) * 2),
    brain: buildBrainReaders(
      engines['brain'],
      config.engines.brain !== undefined,
      config.cadenceMs.brain ?? 60_000,
    ),
    ...buildAtriumDeps(config, engines),
    worker: buildWorkerReader(config.worker, fetch),
    workerActivity: buildWorkerActivityReader(config.worker, fetch),
    workerCosts: buildWorkerCostsReader(config.worker, fetch),
    workerQuality: buildWorkerQualityReader(config.worker, fetch),
    workerJobs: buildWorkerJobClient(config.worker, fetch),
    todoFiles: configuredTodoFiles(config),
    guard: {
      port,
      remotePort: config.remotePort,
      allowedHosts: config.allowedHosts,
      allowedLogins: config.allowedLogins,
    },
    webRoot,
    now: Date.now,
    actions: buildActionDeps(state, engines),
    actionSignal: signal,
    poller,
  })
  return async (request, env) => app.fetch(request, env)
}

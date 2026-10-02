import { createLaunchdCatalog } from '../adapters/launchd/createLaunchdCatalog'
import { recordLaunchdObservation } from '../history/recordLaunchdObservation'
import { createApp } from '../http/createApp'
import { runProcess } from '../process/runProcess'
import type { Hub } from '../types/Hub'
import type { OrbitState } from '../types/OrbitState'
import type { RequestHandler } from '../types/RequestHandler'
import { buildWorkerReader } from './buildWorkerReader'

// The HTTP application over the state, for the port the server really got.
export const buildHandler = (
  state: OrbitState,
  hub: Hub,
  webRoot: string,
  port: number,
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
    worker: buildWorkerReader(config.worker, fetch),
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

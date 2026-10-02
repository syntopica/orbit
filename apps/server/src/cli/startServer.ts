import { buildAdapters } from '../adapters/buildAdapters'
import { recordLaunchdObservation } from '../history/recordLaunchdObservation'
import { createHub } from '../hub/createHub'
import { runProcess } from '../process/runProcess'
import { createScheduler } from '../scheduler/createScheduler'
import type { OrbitState } from '../types/OrbitState'
import { assertWebRoot } from './assertWebRoot'
import { buildHandler } from './buildHandler'
import { listenLoopback } from './listenLoopback'
import { startHistory } from './startHistory'

// Resolves with the bound port once listening. Aborting the signal stops the
// adapters, the intervals and the server, then closes both databases.
export const startServer = async (
  state: OrbitState,
  options: { webRoot: string; signal: AbortSignal },
): Promise<{ port: number }> => {
  await assertWebRoot(options.webRoot)
  const hub = createHub({
    ringSize: 1000,
    recentEvents: 50,
    firstId: Date.now() * 1000,
  })
  const { server, port } = await listenLoopback(state.config.port, (actual) =>
    buildHandler(state, hub, options.webRoot, actual),
  )
  const scheduler = createScheduler(
    buildAdapters({
      config: state.config,
      stateDir: state.stateDir,
      uid: process.getuid?.() ?? 0,
      record: (observation) => {
        recordLaunchdObservation(state.historyDb, observation)
      },
      run: runProcess,
      fetch,
    }),
    hub,
  )
  const stopHistory = startHistory(state.historyDb, hub)
  scheduler.start()
  const stop = (): void => {
    scheduler.stop()
    stopHistory()
    server.close()
    server.closeAllConnections()
    state.close()
  }
  if (options.signal.aborted) stop()
  else options.signal.addEventListener('abort', stop, { once: true })
  return { port }
}

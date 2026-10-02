import { createServerHub } from '../hub/createServerHub'
import type { OrbitState } from '../types/OrbitState'
import { assertWebRoot } from './assertWebRoot'
import { buildHandler } from './buildHandler'
import { buildScheduler } from './buildScheduler'
import { listenLoopback } from './listenLoopback'
import { startHistory } from './startHistory'

// Resolves with the bound port once listening. Aborting the signal stops the
// adapters, the intervals and the server, then closes both databases. A
// failure after listening tears the same things down before it is rethrown.
export const startServer = async (
  state: OrbitState,
  options: { webRoot: string; signal: AbortSignal },
): Promise<{ port: number }> => {
  await assertWebRoot(options.webRoot)
  const hub = createServerHub()
  const { server, port } = await listenLoopback(state.config.port, (actual) =>
    buildHandler(state, hub, options.webRoot, actual),
  )
  let stopScheduler = (): void => undefined
  let stopHistory = (): void => undefined
  const stop = (): void => {
    stopScheduler()
    stopHistory()
    server.close()
    server.closeAllConnections()
    state.close()
  }
  try {
    const scheduler = buildScheduler(state, hub)
    stopScheduler = () => {
      scheduler.stop()
    }
    stopHistory = startHistory(state.historyDb, hub)
    scheduler.start()
  } catch (error) {
    stop()
    throw error
  }
  if (options.signal.aborted) stop()
  else options.signal.addEventListener('abort', stop, { once: true })
  return { port }
}

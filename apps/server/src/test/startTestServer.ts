import { startServer } from '../cli/startServer'
import type { OrbitState } from '../types/OrbitState'
import { openTestState } from './openTestState'
import { webRootWithIndex } from './webRootWithIndex'

// A real server on 127.0.0.1, port 0, over a temporary instance.
export const startTestServer = async (orbit: Record<string, unknown> = {}) => {
  const state: OrbitState = await openTestState(orbit)
  const bound = { ...state, config: { ...state.config, port: 0 } }
  const controller = new AbortController()
  const { port } = await startServer(bound, {
    webRoot: await webRootWithIndex(),
    signal: controller.signal,
    engines: {},
  })
  return { state: bound, controller, port }
}

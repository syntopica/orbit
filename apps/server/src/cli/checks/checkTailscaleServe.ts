import { buildChildEnv } from '../../process/buildChildEnv'
import { runProcess } from '../../process/runProcess'
import type { DoctorCheck } from '../../types/DoctorCheck'
import { readServeStatus } from './readServeStatus'

// The `/` handler of every published name proxies to the published port
// (`remotePort` when set, else `port`), none is exposed by Funnel, and each
// name is in allowedHosts (spec 4, 10). With `remotePort` set, nothing may
// proxy to `port`: requests there skip the action step-up.
export const checkTailscaleServe: DoctorCheck = async (state) => {
  const name = 'tailscale serve'
  const { allowedHosts, remotePort } = state.config
  const port = remotePort ?? state.config.port
  if (allowedHosts.length === 0) {
    return { name, level: 'ok', detail: 'not published (no allowedHosts)' }
  }
  const result = await runProcess({
    file: 'tailscale',
    args: ['serve', 'status', '--json'],
    env: buildChildEnv(state.env, {}),
    timeoutMs: 5000,
    maxBytes: 1_048_576,
  }).catch(() => null)
  if (result === null || result.code !== 0) {
    return { name, level: 'warn', detail: 'tailscale CLI unavailable' }
  }
  const { served, funnelled } = readServeStatus(result.stdout, port)
  if (remotePort !== undefined) {
    const local = readServeStatus(result.stdout, state.config.port)
    if (local.served.length > 0) {
      const detail = `${local.served.join(', ')} proxies to the local port ${String(state.config.port)}, which skips the action step-up; point it at ${String(remotePort)}`
      return { name, level: 'fail', detail }
    }
  }
  if (funnelled.length > 0) {
    const detail = `Funnel exposes orbit publicly: ${funnelled.join(', ')}`
    return { name, level: 'fail', detail }
  }
  if (served.length === 0) {
    const detail = `no root handler proxies to 127.0.0.1:${String(port)}`
    return { name, level: 'fail', detail }
  }
  const unlisted = served.filter((host) => !allowedHosts.includes(host))
  return unlisted.length === 0
    ? { name, level: 'ok', detail: `published as ${served.join(', ')}` }
    : {
        name,
        level: 'fail',
        detail: `published name not in allowedHosts: ${unlisted.join(', ')}`,
      }
}

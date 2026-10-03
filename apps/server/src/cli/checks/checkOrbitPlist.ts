import { homedir } from 'node:os'
import { join } from 'node:path'

import { buildChildEnv } from '../../process/buildChildEnv'
import { runProcess } from '../../process/runProcess'
import type { DoctorCheck } from '../../types/DoctorCheck'
import { readPlistPath } from './readPlistPath'
import { readPlistUmask } from './readPlistUmask'

// The installed LaunchAgent must carry Umask 63 (octal 077): launchd opens the
// log before orbit runs, so only the plist makes it 0600.
export const checkOrbitPlist: DoctorCheck = async (state) => {
  const name = 'orbit plist'
  const plist = join(
    state.env['HOME'] ?? homedir(),
    'Library',
    'LaunchAgents',
    'com.syntopica.orbit.plist',
  )
  const result = await runProcess({
    file: state.config.launchd?.plutil ?? '/usr/bin/plutil',
    args: ['-convert', 'json', '-o', '-', plist],
    env: buildChildEnv(state.env, {}),
    timeoutMs: 5000,
    maxBytes: 1_048_576,
  }).catch(() => null)
  if (result === null) {
    return { name, level: 'warn', detail: 'plutil unavailable' }
  }
  if (result.code !== 0) {
    return { name, level: 'warn', detail: 'LaunchAgent not installed' }
  }
  if (readPlistUmask(result.stdout) !== 63) {
    return {
      name,
      level: 'fail',
      detail: 'Umask is not 63: orbit.log would not be 0600',
    }
  }
  return readPlistPath(result.stdout) === null
    ? {
        name,
        level: 'fail',
        detail: 'no PATH in EnvironmentVariables: engines would not resolve',
      }
    : { name, level: 'ok', detail: 'Umask 63, PATH set' }
}

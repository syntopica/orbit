import { ORBIT_LAUNCHD_LABEL } from '../launchd/orbitLaunchdLabel'
import { buildChildEnv } from '../process/buildChildEnv'
import { runProcess } from '../process/runProcess'

export const restartOrbit = async (
  launchctl: string,
  env: NodeJS.ProcessEnv,
): Promise<boolean> => {
  const uid = process.getuid?.() ?? 0
  const result = await runProcess({
    file: launchctl,
    args: ['kickstart', '-k', `gui/${String(uid)}/${ORBIT_LAUNCHD_LABEL}`],
    env: buildChildEnv(env, {}),
    timeoutMs: 30_000,
    maxBytes: 65_536,
  }).catch(() => null)
  return result?.code === 0
}

import { join } from 'node:path'

import { loadOrbitConfig } from '../../config/loadOrbitConfig'
import { resolveDataDir } from '../../config/resolveDataDir'
import { ensureStateDir } from '../../state/ensureStateDir'
import type { CliIo } from '../../types/CliIo'
import { probeOrbit } from '../../watch/probeOrbit'
import { readFailureCount } from '../../watch/readFailureCount'
import { restartOrbit } from '../../watch/restartOrbit'
import { runWatch } from '../../watch/runWatch'
import { writeFailureCount } from '../../watch/writeFailureCount'
import { printPlistCommand } from './printPlistCommand'

// Run by its own LaunchAgent every five minutes: orbit cannot notice that it
// has hung itself, and launchd's KeepAlive only restarts it when it exits.
export const watchCommand = async (
  args: readonly string[],
  io: CliIo,
): Promise<number> => {
  if (args[0] === '--print-plist')
    return printPlistCommand(io, 'com.syntopica.orbit.watch.plist.template')
  process.umask(0o077)
  const dataDir = resolveDataDir(io.env)
  const config = await loadOrbitConfig(dataDir)
  const path = join(await ensureStateDir(dataDir), 'watch-failures')
  return runWatch({
    probe: async () => probeOrbit(config.port),
    restart: async () =>
      restartOrbit(config.launchd?.launchctl ?? '/bin/launchctl', io.env),
    readCount: async () => readFailureCount(path),
    writeCount: async (count) => writeFailureCount(path, count),
    log: io.out,
  })
}

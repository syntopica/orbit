import { dirname, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildLaunchdPath } from '../../launchd/buildLaunchdPath'
import { readPlistTemplate } from '../../launchd/readPlistTemplate'
import { renderPlistTemplate } from '../../launchd/renderPlistTemplate'
import { stableNodePath } from '../../launchd/stableNodePath'
import type { CliIo } from '../../types/CliIo'

// Prints a LaunchAgent plist for this node, this bundle and this instance.
export const printPlistCommand = (io: CliIo, template?: string): number => {
  const data = io.env['SYNTOPICA_DATA']
  if (data === undefined || !isAbsolute(data)) {
    io.err('orbit: set SYNTOPICA_DATA to the absolute path of the instance')
    return 1
  }
  const bundle = fileURLToPath(import.meta.url)
  const node = stableNodePath(process.execPath, io.env['PATH'])
  io.out(
    renderPlistTemplate(readPlistTemplate(dirname(bundle), template), {
      node,
      orbit: bundle,
      data,
      path: buildLaunchdPath(node, io.env['PATH']),
    }).trimEnd(),
  )
  return 0
}

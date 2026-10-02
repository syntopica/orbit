import { dirname, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readPlistTemplate } from '../../launchd/readPlistTemplate'
import { renderPlistTemplate } from '../../launchd/renderPlistTemplate'
import type { CliIo } from '../../types/CliIo'

// Prints the LaunchAgent plist for this node, this bundle and this instance.
export const printPlistCommand = (io: CliIo): number => {
  const data = io.env['SYNTOPICA_DATA']
  if (data === undefined || !isAbsolute(data)) {
    io.err('orbit: set SYNTOPICA_DATA to the absolute path of the instance')
    return 1
  }
  const bundle = fileURLToPath(import.meta.url)
  const template = readPlistTemplate(dirname(bundle))
  io.out(
    renderPlistTemplate(template, {
      node: process.execPath,
      orbit: bundle,
      data,
    }).trimEnd(),
  )
  return 0
}

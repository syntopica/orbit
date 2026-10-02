import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { E2E } from './paths'

export const runOrbit = async (args: readonly string[]): Promise<string> => {
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [E2E.bundle, ...args],
    {
      env: {
        PATH: process.env['PATH'] ?? '',
        HOME: process.env['HOME'] ?? '',
        SYNTOPICA_DATA: E2E.data,
      },
    },
  )
  return stdout
}

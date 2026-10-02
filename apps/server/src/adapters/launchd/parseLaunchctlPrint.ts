import { ProcessError } from '../../process/ProcessError'
import type { LaunchctlState } from '../../types/LaunchctlState'
import { parseExitCode } from './parseExitCode'
import { parseInteger } from './parseInteger'

export const parseLaunchctlPrint = (text: string): LaunchctlState => {
  const fields = new Map<string, string>()
  for (const line of text.split('\n')) {
    const match = /^\t([a-z][a-z ]*?) = (.*)$/.exec(line.replace(/\r$/, ''))
    if (match?.[1] !== undefined && match[2] !== undefined) {
      const key = match[1].trim()
      if (!fields.has(key)) fields.set(key, match[2].trim())
    }
  }
  const state = fields.get('state')
  if (state === undefined || state === '')
    throw new ProcessError('schema_invalid')
  const lastExit = fields.get('last exit code')
  return {
    state,
    pid: parseInteger(fields.get('pid')),
    runs: parseInteger(fields.get('runs')),
    lastExit: lastExit === undefined ? null : parseExitCode(lastExit),
  }
}

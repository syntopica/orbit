import { ProcessError } from '../../process/ProcessError'
import type { LaunchctlState } from '../../types/LaunchctlState'
import { parseExitCode } from './parseExitCode'

export const parseLaunchctlPrint = (text: string): LaunchctlState => {
  const fields = new Map<string, string>()
  for (const line of text.split('\n')) {
    const match = /^\t([a-z][a-z ]*) = (.*)$/.exec(line)
    if (
      match?.[1] !== undefined &&
      match[2] !== undefined &&
      !fields.has(match[1])
    ) {
      fields.set(match[1], match[2])
    }
  }
  const state = fields.get('state')
  if (state === undefined) throw new ProcessError('schema_invalid')
  const pid = fields.get('pid')
  const runs = fields.get('runs')
  const lastExit = fields.get('last exit code')
  return {
    state,
    pid: pid === undefined ? null : Number(pid),
    runs: runs === undefined ? null : Number(runs),
    lastExit: lastExit === undefined ? null : parseExitCode(lastExit),
  }
}

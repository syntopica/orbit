import { formatRunLine } from '../formatters/formatRunLine'
import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { ProcessError } from './ProcessError'

// Logs one line per engine command: its duration, outcome and how many
// commands were running when it started. Arguments past the subcommand name
// may carry a page id, which is content, so they never reach the line.
export const timedRunner = (
  run: (request: RunRequest) => Promise<RunResult>,
  log: (line: string) => void,
  now: () => number = () => performance.now(),
) =>
  (() => {
    let active = 0
    return async (request: RunRequest): Promise<RunResult> => {
      active += 1
      const concurrent = active
      const started = now()
      const done = (outcome: string): void => {
        log(formatRunLine(request, now() - started, outcome, concurrent))
      }
      try {
        const result = await run(request)
        done(`exit ${String(result.code)}`)
        return result
      } catch (error: unknown) {
        done(error instanceof ProcessError ? error.reason : 'error')
        throw error
      } finally {
        active -= 1
      }
    }
  })()

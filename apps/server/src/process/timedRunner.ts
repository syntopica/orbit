import { formatRunLine } from '../formatters/formatRunLine'
import type { RunClock } from '../types/RunClock'
import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { failureOutcome } from './failureOutcome'
import { systemRunClock } from './systemRunClock'

// Logs one line per engine command: its duration, outcome, how many commands
// were running when it started and the host's one-minute load average when it
// ended, so a slow command can be told from a starved one, and the wall time
// it ended at, so a burst can be matched against what else ran then. Arguments
// past the subcommand name may carry a page id, which is content, so they
// never reach the line.
export const timedRunner = (
  run: (request: RunRequest) => Promise<RunResult>,
  log: (line: string) => void,
  clock: RunClock = systemRunClock,
) =>
  (() => {
    let active = 0
    return async (request: RunRequest): Promise<RunResult> => {
      active += 1
      const concurrent = active
      const started = clock.now()
      const done = (outcome: string): void => {
        const ms = clock.now() - started
        log(
          formatRunLine(request, {
            ms,
            outcome,
            concurrent,
            load: clock.load(),
            at: clock.wall().toISOString(),
          }),
        )
      }
      try {
        const result = await run(request)
        done(`exit ${String(result.code)}`)
        return result
      } catch (error: unknown) {
        done(failureOutcome(error, request))
        throw error
      } finally {
        active -= 1
      }
    }
  })()

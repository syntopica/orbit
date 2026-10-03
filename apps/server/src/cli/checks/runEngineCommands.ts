import { ProcessError } from '../../process/ProcessError'
import type { EngineRunner } from '../../types/EngineRunner'

// Runs each argument list once; a non-zero exit is a failed check.
export const runEngineCommands = async (
  run: EngineRunner | undefined,
  subcommands: readonly (readonly string[])[],
): Promise<number> => {
  if (run === undefined) throw new ProcessError('not_found')
  for (const args of subcommands) {
    const result = await run(args, AbortSignal.timeout(15_000))
    if (result.code !== 0) throw new ProcessError('check_failed')
  }
  return subcommands.length
}

import { hasPlaceholder } from '../../engines/hasPlaceholder'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import { schemaVersionSchema } from '../../engines/schemaVersionSchema'
import { ProcessError } from '../../process/ProcessError'
import type { EngineRunner } from '../../types/EngineRunner'

// Runs each argument list once, judged by stdout like the adapters. An entry
// with a placeholder needs a value doctor does not have, so it is skipped.
export const runEngineCommands = async (
  run: EngineRunner | undefined,
  subcommands: readonly (readonly string[])[],
): Promise<number> => {
  if (run === undefined) throw new ProcessError('not_found')
  const runnable = subcommands.filter((args) => !hasPlaceholder(args))
  for (const args of runnable) {
    const result = await run(args, AbortSignal.timeout(15_000))
    parseEngineDocument(result, schemaVersionSchema)
  }
  return runnable.length
}

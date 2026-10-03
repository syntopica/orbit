import { parseEngineDocument } from '../../engines/parseEngineDocument'
import { schemaVersionSchema } from '../../engines/schemaVersionSchema'
import { ProcessError } from '../../process/ProcessError'
import type { EngineRunner } from '../../types/EngineRunner'

// Runs each argument list once; judged by stdout, like the adapters.
export const runEngineCommands = async (
  run: EngineRunner | undefined,
  subcommands: readonly (readonly string[])[],
): Promise<number> => {
  if (run === undefined) throw new ProcessError('not_found')
  for (const args of subcommands) {
    const result = await run(args, AbortSignal.timeout(15_000))
    parseEngineDocument(result, schemaVersionSchema)
  }
  return subcommands.length
}

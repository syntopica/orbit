import { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { BrainChecksDocuments } from '../../types/BrainChecksDocuments'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainLintSchema } from './brainLintSchema'

// Shared by the adapter and the checks route. `doctor --json` names the
// table's doctor entry, which may carry `--skip` arguments (spec 5.3).
export const readBrainChecks = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<BrainChecksDocuments> => {
  const lint = parseEngineDocument(
    await run(['lint', '--json'], signal),
    brainLintSchema,
  )
  const doctor = parseEngineDocument(
    await run(['doctor', '--json'], signal),
    doctorDocumentSchema,
  )
  return { lint, doctor }
}

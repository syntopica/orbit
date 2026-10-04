import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { AtriumPassesDocument } from '../../types/AtriumPassesDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { ATRIUM_PASSES_ARGS } from './atriumPassesArgs'
import { atriumPassesDocumentSchema } from './atriumPassesDocumentSchema'

// Two log tails: measured at 0.13 s on the full instance, cheap to poll
// inside the atrium adapter's 5 s budget.
export const readAtriumPasses = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<AtriumPassesDocument> =>
  parseEngineDocument(
    await run(ATRIUM_PASSES_ARGS, signal, 3000),
    atriumPassesDocumentSchema,
  )

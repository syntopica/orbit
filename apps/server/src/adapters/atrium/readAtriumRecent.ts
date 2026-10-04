import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { AtriumRecentDocument } from '../../types/AtriumRecentDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { ATRIUM_RECENT_ARGS } from './atriumRecentArgs'
import { atriumRecentDocumentSchema } from './atriumRecentDocumentSchema'

// A detail call, never polled: the per-day totals open every record of the
// window, measured at 2-6 s on the full instance.
export const readAtriumRecent = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<AtriumRecentDocument> =>
  parseEngineDocument(
    await run(ATRIUM_RECENT_ARGS, signal, 30_000),
    atriumRecentDocumentSchema,
  )

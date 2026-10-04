import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { AtriumContextDocument } from '../../types/AtriumContextDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { ATRIUM_CONTEXT_ARGS } from './atriumContextArgs'
import { atriumContextDocumentSchema } from './atriumContextDocumentSchema'

// The query is one argument, checked by the runner against the query bounds.
export const readAtriumContext = async (
  run: EngineRunner,
  query: string,
  signal: AbortSignal,
): Promise<AtriumContextDocument> =>
  parseEngineDocument(
    await run([...ATRIUM_CONTEXT_ARGS, query], signal, 5000),
    atriumContextDocumentSchema,
  )

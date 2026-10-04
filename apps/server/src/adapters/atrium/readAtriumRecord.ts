import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { AtriumShowDocument } from '../../types/AtriumShowDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { ATRIUM_SHOW_ARGS } from './atriumShowArgs'
import { atriumShowDocumentSchema } from './atriumShowDocumentSchema'

// The key is one argument, checked by the runner against `{jobKey}`.
export const readAtriumRecord = async (
  run: EngineRunner,
  jobKey: string,
  signal: AbortSignal,
): Promise<AtriumShowDocument> =>
  parseEngineDocument(
    await run([...ATRIUM_SHOW_ARGS, jobKey], signal, 5000),
    atriumShowDocumentSchema,
  )

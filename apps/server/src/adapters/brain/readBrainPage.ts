import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { BrainPageDocument } from '../../types/BrainPageDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainPageDocumentSchema } from './brainPageDocumentSchema'

// The id is one argument, checked by the runner against the page id pattern.
export const readBrainPage = async (
  run: EngineRunner,
  id: string,
  signal: AbortSignal,
): Promise<BrainPageDocument> =>
  parseEngineDocument(
    await run(['page', '--json', '--id', id], signal),
    brainPageDocumentSchema,
  )

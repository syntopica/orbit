import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { BrainRelatedDocument } from '../../types/BrainRelatedDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainRelatedDocumentSchema } from './brainRelatedDocumentSchema'

// The table fixes `--limit`; orbit never chooses it (D6).
export const readBrainRelated = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<BrainRelatedDocument> =>
  parseEngineDocument(
    await run(['graph', '--json', '--related'], signal),
    brainRelatedDocumentSchema,
  )

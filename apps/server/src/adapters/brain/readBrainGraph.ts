import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { BrainGraphDocument } from '../../types/BrainGraphDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainGraphDocumentSchema } from './brainGraphDocumentSchema'

export const readBrainGraph = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<BrainGraphDocument> =>
  parseEngineDocument(
    await run(['graph', '--json', '--no-html'], signal),
    brainGraphDocumentSchema,
  )

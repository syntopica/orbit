import { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { ClipsDocuments } from '../../types/ClipsDocuments'
import type { EngineRunner } from '../../types/EngineRunner'
import { clipsStatusSchema } from './clipsStatusSchema'

// The two listed subcommands, in the order the adapter has always run them.
export const readClipsDocuments = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<ClipsDocuments> => {
  const status = parseEngineDocument(
    await run(['status', '--json'], signal),
    clipsStatusSchema,
  )
  const doctor = parseEngineDocument(
    await run(['doctor', '--json'], signal),
    doctorDocumentSchema,
  )
  return { status, doctor }
}

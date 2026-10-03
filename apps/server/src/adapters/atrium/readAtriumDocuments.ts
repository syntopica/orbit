import { join } from 'node:path'

import { ProcessError } from '../../process/ProcessError'
import type { AtriumDocuments } from '../../types/AtriumDocuments'
import { atriumRefreshSchema } from './atriumRefreshSchema'
import { atriumSynthesisSchema } from './atriumSynthesisSchema'
import { readStatusFile } from './readStatusFile'

// Shared by the adapter and the detail route; never runs atrium itself.
export const readAtriumDocuments = async (
  statusDir: string,
  signal: AbortSignal,
): Promise<AtriumDocuments> => {
  const refresh = await readStatusFile(
    join(statusDir, 'refresh.json'),
    atriumRefreshSchema,
    signal,
  )
  if (refresh === null) throw new ProcessError('not_found')
  const synthesis = await readStatusFile(
    join(statusDir, 'synthesis.json'),
    atriumSynthesisSchema,
    signal,
  )
  return { refresh, synthesis }
}

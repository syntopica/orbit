import { ProcessError } from '../../process/ProcessError'
import type { LabelEntry } from '../../types/LabelEntry'
import type { LabelReading } from '../../types/LabelReading'
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import { readLabel } from './readLabel'

export const readLabelIsolated = async (
  deps: LaunchdAdapterDeps,
  entry: LabelEntry,
  signal: AbortSignal,
): Promise<LabelReading> => {
  try {
    return await readLabel(deps, entry, signal)
  } catch (error) {
    if (signal.aborted) throw error
    const reason = error instanceof ProcessError ? error.reason : 'check_failed'
    return { entry, loaded: false, state: null, error: reason }
  }
}

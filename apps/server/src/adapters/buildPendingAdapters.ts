import type { Adapter } from '../types/Adapter'
import type { AdapterContext } from '../types/AdapterContext'
import { createPendingAdapter } from './pending/createPendingAdapter'

export const buildPendingAdapters = ({ config }: AdapterContext): Adapter[] => {
  const files = config.pending?.todoFiles ?? []
  return files.length === 0
    ? []
    : [
        createPendingAdapter(
          files,
          config.cadenceMs.pending ?? 60_000,
          config.warnings.pendingBlocked,
        ),
      ]
}

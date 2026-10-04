import { ATRIUM_LABELS } from './atriumLabels'

// Column headers of the recent syntheses table, in order.
export const SYNTHESIS_COLUMNS = [
  ATRIUM_LABELS.time,
  ATRIUM_LABELS.source,
  ATRIUM_LABELS.model,
  ATRIUM_LABELS.tokensColumn,
  ATRIUM_LABELS.duration,
  ATRIUM_LABELS.result,
] as const

import { BLOCKER_LABELS } from '../labels/blockerLabels'
import type { WorkerBlocker } from '../types/WorkerBlocker'
import { formatSpan } from './formatSpan'

// The words after the subject; a code, when present, is shown verbatim after it.
export const formatBlocker = (blocker: WorkerBlocker): string => {
  const label = BLOCKER_LABELS[blocker.kind]
  if (blocker.ms === null) return label
  const span = formatSpan(blocker.ms)
  return blocker.kind === 'stale' ? `${label} ${span} ago` : `${label} ${span}`
}

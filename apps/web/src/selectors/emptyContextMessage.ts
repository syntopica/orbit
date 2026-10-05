import { CONTEXT_LABELS } from '../labels/contextLabels'

// An empty answer whose lexical budget ran out is a timeout, not a miss:
// atrium's search deadline is wall-clock, and under load it can expire before
// the first row is read (2026-10-05: "nubenode" came back empty at load 40.8
// although the same query finds 8 blocks on a quiet machine).
export const emptyContextMessage = (warnings: readonly string[]): string =>
  warnings.includes('lexical_budget_exhausted')
    ? CONTEXT_LABELS.outOfTime
    : CONTEXT_LABELS.empty

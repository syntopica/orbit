import type { WorkerResult } from '@orbit/contract'

import { formatAttemptTokens } from '../formatters/formatAttemptTokens'
import { formatCostOrDash } from '../formatters/formatCostOrDash'
import { formatTimeOrDash } from '../formatters/formatTimeOrDash'
import type { LabelledValue } from '../types/LabelledValue'

// One stored result's metadata. An answer has an executor and usage; a
// control result (failed, expired, split requested) has a code instead.
export const resultSummaryItems = (result: WorkerResult): LabelledValue[] => [
  { label: 'Outcome', value: result.control ?? 'answer' },
  { label: 'Error', value: result.error ?? '—' },
  { label: 'Schema path', value: result.schemaPath ?? '—' },
  {
    label: 'Executor',
    value:
      [result.node, result.provider, result.model]
        .filter((part) => part !== null)
        .join(' · ') || '—',
  },
  {
    label: 'Tokens',
    value: formatAttemptTokens(result.tokensIn, result.tokensOut),
  },
  { label: 'Cost', value: formatCostOrDash(result.costUsd) },
  { label: 'Rating', value: result.rating ?? '—' },
  { label: 'Created', value: formatTimeOrDash(result.createdAt) },
  { label: 'Acknowledged', value: formatTimeOrDash(result.ackedAt) },
]

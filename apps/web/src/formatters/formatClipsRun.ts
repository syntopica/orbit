import type { ClipsItem } from '@orbit/contract'

import { formatAttemptTokens } from './formatAttemptTokens'
import { formatSpan } from './formatSpan'

// "escalated · 1m 33s · 120 in · 12 out"; tokens only when reported.
export const formatClipsRun = (
  run: NonNullable<ClipsItem['lastRun']>,
): string =>
  [
    run.outcome,
    formatSpan(run.durationMs),
    ...(run.usage === null
      ? []
      : [formatAttemptTokens(run.usage.inputTokens, run.usage.outputTokens)]),
  ].join(' · ')

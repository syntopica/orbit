import type { QueueAccumulator } from '../types/QueueAccumulator'
import type { QueueActivity } from '../types/QueueActivity'
import { foldTopCounts } from './foldTopCounts'
import { meanOrNull } from './meanOrNull'

export const toQueueActivity = (acc: QueueAccumulator): QueueActivity => ({
  succeeded: acc.succeeded,
  outcomes: foldTopCounts(acc.outcomes, Number.POSITIVE_INFINITY),
  providers: foldTopCounts(acc.providers, Number.POSITIVE_INFINITY),
  errors: foldTopCounts(acc.errors, 3),
  meanWallMs: meanOrNull(acc.wallMs, acc.attempts),
  tokensIn: acc.tokensIn,
  tokensOut: acc.tokensOut,
})

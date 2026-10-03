import type { WorkerActivityRow } from '@orbit/contract'

import type { WorkerActivityReport } from '../types/WorkerActivityReport'
import { identifierOrNull } from './identifierOrNull'
import { isIdentifier } from './isIdentifier'
import { secondsToMs } from './secondsToMs'

// A row whose queue, provider or outcome fails the identifier rule is dropped;
// an error code that fails is blanked (spec 7.3).
export const toActivityRows = (
  rows: WorkerActivityReport['rows'],
): WorkerActivityRow[] =>
  rows
    .filter(
      (r) =>
        isIdentifier(r.queue) &&
        isIdentifier(r.provider) &&
        isIdentifier(r.outcome),
    )
    .map((r) => ({
      bucket: Math.round(r.bucket * 1000),
      queue: r.queue,
      provider: r.provider,
      sampling: r.sampling,
      outcome: r.outcome,
      error: identifierOrNull(r.error),
      attempts: r.attempts,
      wallMs: secondsToMs(r.wall_s),
      tokensIn: r.tokens_in,
      tokensOut: r.tokens_out,
    }))

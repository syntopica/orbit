import type { WorkerCostRow } from '@orbit/contract'

import type { WorkerCostsReport } from '../types/WorkerCostsReport'
import { isIdentifier } from './isIdentifier'
import { secondsToMs } from './secondsToMs'

export const toCostRows = (rows: WorkerCostsReport['rows']): WorkerCostRow[] =>
  rows
    .filter((row) => isIdentifier(row.provider) && isIdentifier(row.queue))
    .map((row) => ({
      day: Date.parse(`${row.day}T00:00:00.000Z`),
      provider: row.provider,
      queue: row.queue,
      attempts: row.attempts,
      succeeded: row.succeeded,
      tokensIn: row.tokens_in,
      tokensOut: row.tokens_out,
      costUsd: row.cost_usd,
      wallMs: secondsToMs(row.wall_s),
    }))

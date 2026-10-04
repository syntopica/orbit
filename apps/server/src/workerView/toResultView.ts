import type { WorkerResult } from '@orbit/contract'
import type { z } from 'zod'

import type { workerResultReportSchema } from '../adapters/worker/workerResultReportSchema'
import { amountOrNull } from './amountOrNull'
import { countOrNull } from './countOrNull'
import { identifierOrNull } from './identifierOrNull'
import { isIdentifier } from './isIdentifier'
import { secondsToMs } from './secondsToMs'
import { secondsToMsOrNull } from './secondsToMsOrNull'

// A result without a valid id is dropped; every other field is secondary.
export const toResultView = (
  row: z.infer<typeof workerResultReportSchema>,
): WorkerResult | null => {
  if (!isIdentifier(row.result_id)) return null
  return {
    resultId: row.result_id,
    control: identifierOrNull(row.control),
    error: identifierOrNull(row.detail?.error),
    schemaPath: identifierOrNull(row.detail?.schema_path),
    node: identifierOrNull(row.executor?.node),
    provider: identifierOrNull(row.executor?.provider),
    model: identifierOrNull(row.executor?.model),
    tokensIn: countOrNull(row.usage?.tokens_in),
    tokensOut: countOrNull(row.usage?.tokens_out),
    costUsd: amountOrNull(row.usage?.cost_usd),
    rating: identifierOrNull(row.rating),
    createdAt: secondsToMs(row.created),
    ackedAt: secondsToMsOrNull(row.acked),
  }
}

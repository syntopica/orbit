import { z } from 'zod'

import { amountOrNullSchema } from './amountOrNullSchema'
import { countOrNullSchema } from './countOrNullSchema'
import { identifierOrNullSchema } from './identifierOrNullSchema'
import { identifierSchema } from './identifierSchema'

// Token, cost and wall totals sum the job's settled attempts; `last*` name
// its newest attempt, running or not.
export const workerJobSchema = z.object({
  id: identifierSchema,
  queue: identifierSchema,
  producer: identifierSchema,
  state: identifierSchema,
  privacy: z.enum(['public', 'internal', 'personal', 'mail', 'secret']),
  tier: identifierSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  attempts: z.number().int().nonnegative(),
  lastError: identifierSchema.nullable(),
  acked: z.number().nullable(),
  retryOf: identifierSchema.nullable(),
  sampling: z.boolean(),
  kind: identifierOrNullSchema,
  model: identifierOrNullSchema,
  priority: countOrNullSchema,
  finishedAt: amountOrNullSchema,
  deadlineAt: amountOrNullSchema,
  leaseNode: identifierOrNullSchema,
  leaseExpiresAt: amountOrNullSchema,
  parentId: identifierOrNullSchema,
  preemptions: countOrNullSchema,
  tokensIn: countOrNullSchema,
  tokensOut: countOrNullSchema,
  costUsd: amountOrNullSchema,
  wallMs: amountOrNullSchema,
  lastModel: identifierOrNullSchema,
  lastProvider: identifierOrNullSchema,
  lastStartedAt: amountOrNullSchema,
  lastOutcome: identifierOrNullSchema,
})

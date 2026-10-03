import { z } from 'zod'

import { COMPONENT_IDS } from '../componentIds'
import { FLOW_STAGE_IDS } from '../flowStageIds'
import { FLOW_STAGE_STATES } from '../flowStageStates'
import { PENDING_KEYS } from '../pendingKeys'
import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'
import { metricValueSchema } from './metricValueSchema'

// GET /api/memory/flow (spec 7.4): stage states, values and edge rates.
export const memoryFlowSchema = z.object({
  now: z.number(),
  stages: z.array(
    z.object({
      id: z.enum(FLOW_STAGE_IDS),
      component: z.enum(COMPONENT_IDS),
      state: z.enum(FLOW_STAGE_STATES),
      freshAt: z.number().nullable(),
      policyMs: z.number().nullable(),
      label: identifierSchema.nullable(),
      lastRunAt: z.number().nullable(),
      backlog: metricValueSchema.nullable(),
      metrics: z.array(metricValueSchema),
      pending: z.array(
        z.object({
          key: z.enum(PENDING_KEYS),
          count: countSchema,
          oldestAt: z.number().nullable(),
        }),
      ),
    }),
  ),
  edges: z.array(
    z.object({
      from: z.enum(FLOW_STAGE_IDS),
      to: z.enum(FLOW_STAGE_IDS),
      perHour: z.number().nullable(),
      flowing: z.boolean(),
    }),
  ),
})

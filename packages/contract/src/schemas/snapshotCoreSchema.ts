import { z } from 'zod'

import { COMPONENT_IDS } from '../componentIds'
import { eventSchema } from './eventSchema'
import { healthSchema } from './healthSchema'
import { metricSchema } from './metricSchema'
import { pendingSchema } from './pendingSchema'

export const snapshotCoreSchema = z
  .object({
    component: z.enum(COMPONENT_IDS),
    health: healthSchema,
    metrics: z.array(metricSchema).max(64),
    pending: z.array(pendingSchema).max(32),
    events: z.array(eventSchema).max(100),
    observedAt: z.iso.datetime(),
  })
  .strict()

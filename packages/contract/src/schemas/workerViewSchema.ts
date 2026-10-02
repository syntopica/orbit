import { z } from 'zod'

import { workerCooldownSchema } from './workerCooldownSchema'
import { workerFailureSchema } from './workerFailureSchema'
import { workerNodeSchema } from './workerNodeSchema'
import { workerQueueSchema } from './workerQueueSchema'

// GET /api/worker: epoch milliseconds and millisecond durations only.
export const workerViewSchema = z.object({
  now: z.number(),
  queues: z.array(workerQueueSchema),
  nodes: z.array(workerNodeSchema),
  cooldowns: z.array(workerCooldownSchema),
  failures: z.array(workerFailureSchema).max(50),
})

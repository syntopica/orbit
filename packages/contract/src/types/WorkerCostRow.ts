import type { z } from 'zod'

import type { workerCostRowSchema } from '../schemas/workerCostRowSchema'

export type WorkerCostRow = z.infer<typeof workerCostRowSchema>

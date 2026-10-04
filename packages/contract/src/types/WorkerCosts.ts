import type { z } from 'zod'

import type { workerCostsSchema } from '../schemas/workerCostsSchema'

export type WorkerCosts = z.infer<typeof workerCostsSchema>

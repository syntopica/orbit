import type { z } from 'zod'

import type { workerActivitySchema } from '../schemas/workerActivitySchema'

export type WorkerActivity = z.infer<typeof workerActivitySchema>

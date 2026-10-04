import type { z } from 'zod'

import type { workerJobDetailSchema } from '../schemas/workerJobDetailSchema'

export type WorkerJobDetail = z.infer<typeof workerJobDetailSchema>

import type { z } from 'zod'

import type { workerNodeSchema } from '../schemas/workerNodeSchema'

export type WorkerNode = z.infer<typeof workerNodeSchema>
